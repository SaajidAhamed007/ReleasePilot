// Load .env file for local development.
// In GitHub Actions, secrets are injected as real environment variables
// so dotenv is a no-op there — it never overwrites existing env vars.
import "dotenv/config";

import { getGithubContext } from "./github/githubContext.js";
import { generateReleaseFiles } from "./ai/generateReleaseFiles.js";
import { commitChanges } from "./git/commitChanges.js";

async function main(): Promise<void> {
  // Log current GitHub context (repo, sha, ref)
  console.log("🚀 ReleasePilot starting...");
  console.log(getGithubContext());

  // Generate AI-powered CHANGELOG.md and RELEASE_NOTES.md
  await generateReleaseFiles();

  // Commit and push the generated files back to the repository
  commitChanges();
}

main().catch((error: unknown) => {
  console.error("❌ ReleasePilot failed:", error);
  process.exit(1);
});
