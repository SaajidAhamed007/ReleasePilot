import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedRepos } from "@/db/schema";
import { getOwnedRepo } from "@/lib/get-owned-repo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await params;
  const repo = await getOwnedRepo(session.user.id, repoId);
  if (!repo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ repo });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await params;
  const repo = await getOwnedRepo(session.user.id, repoId);
  if (!repo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(connectedRepos)
    .set({ status: "revoked", updatedAt: new Date() })
    .where(eq(connectedRepos.id, repo.id));

  return NextResponse.json({ ok: true });
}
