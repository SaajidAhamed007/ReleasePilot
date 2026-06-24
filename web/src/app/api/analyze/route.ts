import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { connectedRepos, releases } from "@/db/schema";
import { ingestionPayloadSchema } from "@/lib/ai/schema";
import { analyzeRelease } from "@/lib/ai/analyze";

const MIN_SECONDS_BETWEEN_ANALYSES = 30;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(eq(connectedRepos.ingestionTokenHash, tokenHash))
    .limit(1);

  if (!repo || repo.status === "revoked") {
    return NextResponse.json({ error: "Invalid or revoked token" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ingestionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const payload = parsed.data;

  if (payload.repoFullName !== repo.fullName) {
    return NextResponse.json(
      { error: "Token does not match the supplied repository" },
      { status: 403 }
    );
  }

  if (repo.lastAnalyzedAt) {
    const secondsSinceLast = (Date.now() - repo.lastAnalyzedAt.getTime()) / 1000;
    if (secondsSinceLast < MIN_SECONDS_BETWEEN_ANALYSES) {
      return NextResponse.json(
        { error: "Too many requests, please wait before retrying" },
        { status: 429 }
      );
    }
  }

  const [releaseRow] = await db
    .insert(releases)
    .values({
      repoId: repo.id,
      commitSha: payload.commitSha,
      ref: payload.ref,
      rawCommitCount: payload.commits.length,
      status: "processing",
    })
    .returning({ id: releases.id });

  try {
    const { result, markdownSummary } = await analyzeRelease(payload);

    await db
      .update(releases)
      .set({ structuredData: result, status: "completed" })
      .where(eq(releases.id, releaseRow.id));

    await db
      .update(connectedRepos)
      .set({ status: "active", lastAnalyzedAt: new Date(), updatedAt: new Date() })
      .where(eq(connectedRepos.id, repo.id));

    return NextResponse.json({
      releaseId: releaseRow.id,
      structuredData: result,
      markdownSummary,
    });
  } catch (error) {
    await db
      .update(releases)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(releases.id, releaseRow.id));

    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
