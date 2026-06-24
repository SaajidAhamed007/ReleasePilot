import fs from "fs";
import { getAllCommits, getLatestCommitStat } from "../github/getCommit.js";
import { analyzeCommits } from "./analyzer.js";

const RELEASE_DIR = "release-notes";
const EVOLUTION_FILE = `${RELEASE_DIR}/PROJECT_EVOLUTION.md`;
const LATEST_FILE = `${RELEASE_DIR}/LATEST_COMMIT.md`;

/**
 * Overwrites two fixed Markdown files on every commit — no versioned folders.
 *
 *   release-notes/PROJECT_EVOLUTION.md  — full project history narrative
 *   release-notes/LATEST_COMMIT.md      — breakdown of the latest commit
 *
 * Both files are always up-to-date with the current state of the repo.
 */
export async function generateReleaseFiles(): Promise<void> {
  // Step 1: Fetch full commit history for the evolution document
  const allCommits = getAllCommits();
  console.log(`📋 Fetched ${allCommits.length} total commit(s) for analysis.`);

  // Step 2: Fetch file-change stats for the latest commit
  const latestFileStat = getLatestCommitStat();
  console.log("📊 Latest commit file stats retrieved.");

  // Step 3: Send to Gemini (or use fallback if API is unavailable)
  const { evolution, latestCommit } = await analyzeCommits(
    allCommits,
    latestFileStat
  );

  // Step 4: Ensure the release-notes directory exists
  fs.mkdirSync(RELEASE_DIR, { recursive: true });

  // Step 5: Overwrite the same two files every time
  fs.writeFileSync(EVOLUTION_FILE, evolution, "utf-8");
  fs.writeFileSync(LATEST_FILE, latestCommit, "utf-8");

  console.log(`📄 PROJECT_EVOLUTION.md → ${EVOLUTION_FILE}`);
  console.log(`📄 LATEST_COMMIT.md     → ${LATEST_FILE}`);
  console.log(`✅ Release files updated successfully.`);
}
