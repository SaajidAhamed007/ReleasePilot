import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedRepos } from "@/db/schema";
import { getGithubAccessToken } from "@/lib/get-github-token";
import { verifyRepoAdmin, createInstallationPR } from "@/lib/github";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.owner || !body?.name) {
    return NextResponse.json({ error: "owner and name are required" }, { status: 400 });
  }

  const accessToken = await getGithubAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No GitHub access token on file" }, { status: 400 });
  }

  // Never trust the client's claimed repo metadata - re-verify admin access server-side.
  const repo = await verifyRepoAdmin(accessToken, body.owner, body.name);
  if (!repo) {
    return NextResponse.json(
      { error: "You don't have admin access to this repository" },
      { status: 403 }
    );
  }

  const [existing] = await db
    .select()
    .from(connectedRepos)
    .where(eq(connectedRepos.githubRepoId, repo.githubRepoId))
    .limit(1);

  if (existing && existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "This repository is already connected by another user" },
      { status: 409 }
    );
  }

  const ingestionToken = `rpit_${randomBytes(32).toString("hex")}`;
  const ingestionTokenHash = createHash("sha256").update(ingestionToken).digest("hex");

  const { prUrl } = await createInstallationPR(
    accessToken,
    repo.owner,
    repo.name,
    repo.defaultBranch,
    ingestionToken
  );

  if (existing) {
    await db
      .update(connectedRepos)
      .set({
        defaultBranch: repo.defaultBranch,
        ingestionTokenHash,
        installationPrUrl: prUrl,
        status: "pending_pr",
        updatedAt: new Date(),
      })
      .where(eq(connectedRepos.id, existing.id));

    return NextResponse.json({ prUrl, repoId: existing.id });
  }

  const [inserted] = await db
    .insert(connectedRepos)
    .values({
      userId: session.user.id,
      githubRepoId: repo.githubRepoId,
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      defaultBranch: repo.defaultBranch,
      ingestionTokenHash,
      installationPrUrl: prUrl,
      status: "pending_pr",
    })
    .returning({ id: connectedRepos.id });

  return NextResponse.json({ prUrl, repoId: inserted.id });
}
