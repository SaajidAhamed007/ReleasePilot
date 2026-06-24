import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { connectedRepos } from "@/db/schema";

export async function getOwnedRepo(userId: string, repoId: string) {
  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(and(eq(connectedRepos.id, repoId), eq(connectedRepos.userId, userId)))
    .limit(1);

  return repo ?? null;
}
