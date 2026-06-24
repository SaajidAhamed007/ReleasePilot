import fs from "fs";
import { getAllCommits, getLatestCommitStat } from "../github/getCommit.js";
import { getNextReleaseVersion } from "../utils/version.js";
import { analyzeCommits } from "./analyzer.js";

/**
 * Generates two AI-powered Markdown files per release:
 *
 *   PROJECT_EVOLUTION.md  — narrative of how the whole project evolved
 *                           (reads ALL commits, not just recent ones)
 *
 *   LATEST_COMMIT.md      — detailed breakdown of the single latest commit
 *                           (includes files changed, workflow impact, risk)
 *
 * Directory structure (same pattern as the original generateMockFiles):
 *   release-notes/release-<N>/PROJECT_EVOLUTION.md
 *   release-notes/release-<N>/LATEST_COMMIT.md
 */
export async function generateReleaseFiles(): Promise<void> {
  // Step 1: Fetch full commit history for the evolution document
  const allCommits = getAllCommits();
  console.log(`📋 Fetched ${allCommits.length} total commit(s) for analysis.`);

  // Step 2: Fetch file-change stats for the latest commit (for the detail document)
  const latestFileStat = getLatestCommitStat();
  console.log("📊 Latest commit file stats retrieved.");

  // Step 3: Send to Gemini (or use fallback if API is unavailable)
  const { evolution, latestCommit } = await analyzeCommits(
    allCommits,
    latestFileStat
  );

  // Step 4: Determine the next release version number (reuses existing utility)
  const version = getNextReleaseVersion();
  const releaseDir = `release-notes/release-${version}`;

  // Step 5: Create the release directory (same pattern as generateMockFiles)
  fs.mkdirSync(releaseDir, { recursive: true });

  // Step 6: Write the two AI-generated documents
  fs.writeFileSync(`${releaseDir}/PROJECT_EVOLUTION.md`, evolution, "utf-8");
  fs.writeFileSync(`${releaseDir}/LATEST_COMMIT.md`, latestCommit, "utf-8");

  console.log(`📄 PROJECT_EVOLUTION.md → ${releaseDir}/PROJECT_EVOLUTION.md`);
  console.log(`📄 LATEST_COMMIT.md     → ${releaseDir}/LATEST_COMMIT.md`);
  console.log(`✅ Release files written successfully.`);
}
