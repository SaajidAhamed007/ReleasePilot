import * as core from "@actions/core";
import { generateReleaseFiles } from "./ai/generateReleaseFiles.js";
import { commitReleaseNotes } from "./git/commitChanges.js";

async function run(): Promise<void> {
  try {
    // ── Read all inputs declared in action.yml ───────────────────────────────
    const releaseiqToken = core.getInput("releaseiq-token", { required: true });
    const releaseiqApiUrl = core.getInput("releaseiq-api-url") || "https://release-pilot-murex.vercel.app";
    const githubToken = core.getInput("github-token");
    const shouldCommit = core.getInput("commit-notes") === "true";
    const commitMessage = core.getInput("commit-message");
    const evolutionFile = core.getInput("evolution-file");
    const latestCommitFile = core.getInput("latest-commit-file");
    const maxCommits = parseInt(core.getInput("max-commits") || "100", 10);

    // Mask the token so it never appears in workflow logs
    core.setSecret(releaseiqToken);

    // Expose as env vars so the ai/ modules can read them
    process.env.RELEASEIQ_TOKEN = releaseiqToken;
    process.env.RELEASEIQ_API_URL = releaseiqApiUrl;

    core.info("🚀 ReleasePilot starting...");
    core.info(`📁 Evolution file     : ${evolutionFile}`);
    core.info(`📁 Latest commit file : ${latestCommitFile}`);
    core.info(`📋 Max commits        : ${maxCommits}`);

    // ── Generate the two release note files ──────────────────────────────────
    // Runs git log and git diff-tree against the CALLING repository's checkout
    // (GitHub Actions sets CWD to $GITHUB_WORKSPACE, which is the caller's repo)
    await generateReleaseFiles({ evolutionFile, latestCommitFile, maxCommits });

    // ── Expose output paths to downstream steps ───────────────────────────────
    core.setOutput("evolution-file", evolutionFile);
    core.setOutput("latest-commit-file", latestCommitFile);

    // ── Optionally commit and push ────────────────────────────────────────────
    if (shouldCommit) {
      commitReleaseNotes({
        githubToken,
        filePaths: [evolutionFile, latestCommitFile],
        commitMessage,
      });
    } else {
      core.info("ℹ️  Skipping commit — commit-notes input is 'false'.");
    }

    core.info("✅ ReleasePilot completed successfully.");
  } catch (error) {
    // setFailed marks the workflow step as failed and prints the message
    core.setFailed(`ReleasePilot failed: ${(error as Error).message}`);
  }
}

run();
