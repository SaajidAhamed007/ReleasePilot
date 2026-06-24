import { Commit, FileDiff } from "../github/getCommit.js";
import { getGithubContext } from "../github/githubContext.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  // PROJECT_EVOLUTION.md — narrative of how the whole project changed over time
  evolution: string;
  // LATEST_COMMIT.md — deep dive into what the most recent commit changed
  latestCommit: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Minimal fallback used when the ReleaseIQ backend is unreachable or errors.
 * Still produces valid Markdown so the pipeline never breaks a customer's CI run.
 */
function buildFallback(commits: Commit[]): AnalysisResult {
  const today = new Date().toISOString().split("T")[0];
  const latest = commits[0];

  const allBullets = [...commits]
    .reverse()
    .map((c) => `- \`${c.sha.slice(0, 7)}\` ${c.message}`)
    .join("\n");

  const evolution = [
    "# Project Evolution",
    "",
    `> Generated on ${today} — ReleaseIQ backend unavailable, showing raw commit history.`,
    "",
    "## Commit History (Oldest → Newest)",
    "",
    allBullets || "- No commits found.",
  ].join("\n");

  const latestCommit = latest
    ? [
        "# Latest Commit Analysis",
        "",
        `> Generated on ${today} — ReleaseIQ backend unavailable.`,
        "",
        "## Commit Summary",
        `**Commit:** \`${latest.sha.slice(0, 7)}\``,
        `**Author:** ${latest.author}`,
        `**Date:** ${latest.date}`,
        `**Message:** ${latest.message}`,
      ].join("\n")
    : "# Latest Commit Analysis\n\n- No commits found.";

  return { evolution, latestCommit };
}

interface AnalyzeBackendResponse {
  releaseId: string;
  structuredData: unknown;
  markdownSummary: string;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Sends commit history and the latest commit's diffs to the ReleaseIQ backend
 * for AI analysis, and returns Markdown derived from its structured response.
 *
 * @param allCommits      Complete commit history (for the evolution doc)
 * @param latestDiffs     Per-file diffs for the most recent commit
 *
 * Graceful failure strategy:
 *   1. Empty commit list      → placeholder Markdown, no API call
 *   2. Backend unreachable    → fallback (raw commit list), no crash
 *   3. Backend returns error  → fallback + error logged, no crash
 */
export async function analyzeCommits(
  allCommits: Commit[],
  latestDiffs: FileDiff[]
): Promise<AnalysisResult> {
  // ── Case 1: Nothing to analyze ──────────────────────────────────────────────
  if (allCommits.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    return {
      evolution: `# Project Evolution\n\n> ${today}\n\n- No commits found in this repository.`,
      latestCommit: `# Latest Commit Analysis\n\n- No commits found in this repository.`,
    };
  }

  const apiUrl = process.env.RELEASEIQ_API_URL;
  const ingestionToken = process.env.RELEASEIQ_TOKEN;

  if (!apiUrl || !ingestionToken) {
    console.warn(
      "⚠️  RELEASEIQ_API_URL or RELEASEIQ_TOKEN is not set. Using fallback output."
    );
    return buildFallback(allCommits);
  }

  try {
    const { repository, sha, ref } = getGithubContext();
    const latestCommit = allCommits[0];

    console.log(`🤖 Sending ${allCommits.length} commit(s) to ReleaseIQ for analysis...`);
    const response = await fetch(`${apiUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ingestionToken}`,
      },
      body: JSON.stringify({
        repoFullName: repository,
        commitSha: sha ?? latestCommit.sha,
        ref: ref ?? "",
        commits: allCommits,
        diffs: latestDiffs,
      }),
    });

    if (!response.ok) {
      throw new Error(`ReleaseIQ backend returned ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as AnalyzeBackendResponse;
    console.log(`✅ ReleaseIQ analysis received (release ${data.releaseId}).`);

    return {
      evolution: data.markdownSummary,
      latestCommit: data.markdownSummary,
    };
  } catch (error) {
    console.error("❌ ReleaseIQ analysis failed:", (error as Error).message);
    console.warn("⚠️  Falling back to basic output.");
    return buildFallback(allCommits);
  }
}
