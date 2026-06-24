import { execSync, spawnSync } from "child_process";
import * as core from "@actions/core";

interface CommitOptions {
  githubToken: string;
  filePaths: string[];
  commitMessage: string;
}

/**
 * Commits the generated release note files and pushes them to the repository
 * that triggered the workflow (the calling repo, not ReleasePilot's own repo).
 *
 * Authentication: uses the provided github-token to set the remote URL so git
 * push succeeds without an interactive login prompt.
 *
 * Idempotent: if the generated files have not changed since the last run,
 * "nothing to commit" is treated as success, not an error.
 */
export function commitReleaseNotes({
  githubToken,
  filePaths,
  commitMessage,
}: CommitOptions): void {
  try {
    // Configure the bot committer identity.
    // These values are the standard GitHub Actions bot identity.
    execSync('git config user.name "github-actions[bot]"', { stdio: "pipe" });
    execSync(
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
      { stdio: "pipe" }
    );

    // Inject the token into the remote URL so `git push` can authenticate.
    // GITHUB_REPOSITORY is set by GitHub Actions as "owner/repo".
    const repo = process.env.GITHUB_REPOSITORY;
    if (repo && githubToken) {
      execSync(
        `git remote set-url origin https://x-access-token:${githubToken}@github.com/${repo}.git`,
        { stdio: "pipe" }
      );
    }

    // Stage only the specific files ReleasePilot wrote — never `git add .`
    for (const filePath of filePaths) {
      execSync(`git add "${filePath}"`, { stdio: "pipe" });
    }

    // spawnSync passes the commit message as a separate argv element,
    // which prevents shell injection if the message contains quotes or
    // special characters.
    const commitResult = spawnSync("git", ["commit", "-m", commitMessage], {
      stdio: "pipe",
      encoding: "utf-8",
    });

    if (commitResult.status === 0) {
      core.info("📝 Committed release notes.");
      execSync("git push", { stdio: "inherit" });
      core.info("🚀 Pushed release notes to the repository.");
    } else {
      // Exit code 1 means "nothing to commit" — files were already up to date.
      core.info(
        "ℹ️  No changes to commit — release notes are already up to date."
      );
    }
  } catch (error) {
    // Treat commit/push failure as a warning, not a fatal error.
    // The release notes were still generated and are available as artifacts.
    core.warning(
      `⚠️  Could not commit release notes: ${(error as Error).message}`
    );
  }
}
