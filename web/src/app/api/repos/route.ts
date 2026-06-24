import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGithubAccessToken } from "@/lib/get-github-token";
import { listAdminRepos } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getGithubAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No GitHub access token on file" }, { status: 400 });
  }

  const repos = await listAdminRepos(accessToken);
  return NextResponse.json({ repos });
}
