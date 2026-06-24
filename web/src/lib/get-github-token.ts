import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";

export async function getGithubAccessToken(userId: string): Promise<string | null> {
  const [account] = await db
    .select({ access_token: accounts.access_token })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")))
    .limit(1);

  return account?.access_token ?? null;
}
