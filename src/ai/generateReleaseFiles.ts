import fs from "fs";
import path from "path";
import * as core from "@actions/core";
import { getAllCommits, getLatestCommitDiffs } from "../github/getCommit.js";
import { analyzeCommits } from "./analyzer.js";

interface GenerateOptions {
  evolutionFile: string;   // e.g. "release-notes/PROJECT_EVOLUTION.md"
  latestCommitFile: string; // e.g. "release-notes/LATEST_COMMIT.md"
  maxCommits: number;       // how many commits to pass to Gemini
}

/**
 * Orchestrates the full release note generation pipeline:
 *   1. Read the calling repo's git history (git runs in $GITHUB_WORKSPACE)
 *   2. Send commits to Gemini for analysis
 *   3. Write two Markdown files at the caller-configured paths
 *
 * Output paths are relative to the current working directory
 * ($GITHUB_WORKSPACE — the calling repository root).
 */
export async function generateReleaseFiles({
  evolutionFile,
  latestCommitFile,
  maxCommits,
}: GenerateOptions): Promise<void> {
  // Step 1: Read the calling repo's full commit history
  const allCommits = getAllCommits(maxCommits);
  core.info(`📋 Fetched ${allCommits.length} commit(s) from repository.`);

  // Step 2: Get per-file diffs for the latest commit
  const latestDiffs = getLatestCommitDiffs();

  // Step 3: Generate content via the ReleaseIQ backend (or fall back to raw commit list)
  const { evolution, latestCommit } = await analyzeCommits(
    allCommits,
    latestDiffs
  );

  // Step 4: Create output directories if they do not exist.
  // The calling repo may have no release-notes/ folder at all.
  fs.mkdirSync(path.dirname(evolutionFile), { recursive: true });
  fs.mkdirSync(path.dirname(latestCommitFile), { recursive: true });

  // Step 5: Write (overwrite) the two documents
  fs.writeFileSync(evolutionFile, evolution, "utf-8");
  fs.writeFileSync(latestCommitFile, latestCommit, "utf-8");

  core.info(`📄 Written: ${evolutionFile}`);
  core.info(`📄 Written: ${latestCommitFile}`);
}
