import { GoogleGenerativeAI } from "@google/generative-ai";
import { Commit } from "../github/getCommit.js";
import { buildPrompt } from "./prompt.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  // PROJECT_EVOLUTION.md — narrative of how the whole project changed over time
  evolution: string;
  // LATEST_COMMIT.md — deep dive into what the most recent commit changed
  latestCommit: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Minimal fallback used when Gemini is unavailable.
 * Still produces valid Markdown so the pipeline never breaks.
 */
function buildFallback(commits: Commit[]): AnalysisResult {
  const today = new Date().toISOString().split("T")[0];
  const latest = commits[0];

  // Chronological bullet list of all commits (oldest first)
  const allBullets = [...commits]
    .reverse()
    .map((c) => `- \`${c.sha.slice(0, 7)}\` ${c.message}`)
    .join("\n");

  const evolution = [
    "# Project Evolution",
    "",
    `> Generated on ${today} — Gemini API unavailable, showing raw commit history.`,
    "",
    "## Commit History (Oldest → Newest)",
    "",
    allBullets || "- No commits found.",
  ].join("\n");

  const latestCommit = latest
    ? [
        "# Latest Commit Analysis",
        "",
        `> Generated on ${today} — Gemini API unavailable.`,
        "",
        "## Commit Summary",
        `**Commit:** \`${latest.sha.slice(0, 7)}\``,
        `**Author:** ${latest.author}`,
        `**Date:** ${latest.date}`,
        `**Message:** ${latest.message}`,
        "",
        "## Note",
        "Set the `GEMINI_API_KEY` environment variable to get a full AI-powered analysis.",
      ].join("\n")
    : "# Latest Commit Analysis\n\n- No commits found.";

  return { evolution, latestCommit };
}

/**
 * Splits Gemini's raw text on the two known delimiters.
 *
 * Expected format from the prompt:
 *   ===EVOLUTION===
 *   ...evolution content...
 *   ===LATEST_COMMIT===
 *   ...latest commit content...
 *
 * Throws if either section is missing so the caller can fall back gracefully.
 */
function parseResponse(text: string): AnalysisResult {
  const parts = text.split("===LATEST_COMMIT===");

  const rawEvolution = parts[0].replace("===EVOLUTION===", "").trim();
  const rawLatestCommit = (parts[1] ?? "").trim();

  if (!rawEvolution || !rawLatestCommit) {
    throw new Error(
      "Gemini response is missing ===EVOLUTION=== or ===LATEST_COMMIT=== delimiter."
    );
  }

  return {
    evolution: rawEvolution,
    latestCommit: rawLatestCommit,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Sends commit history to Gemini and returns two Markdown documents:
 *   - evolution:    full project history narrative
 *   - latestCommit: detailed breakdown of the most recent commit
 *
 * @param allCommits      Complete commit history (for the evolution doc)
 * @param latestFileStat  Output of `git diff-tree --stat HEAD` (for the detail doc)
 *
 * Graceful failure strategy:
 *   1. Empty commit list   → placeholder Markdown, no API call
 *   2. No GEMINI_API_KEY   → fallback (raw commit list), no crash
 *   3. Gemini API error    → fallback + error logged, no crash
 *   4. Bad response format → fallback + error logged, no crash
 */
export async function analyzeCommits(
  allCommits: Commit[],
  latestFileStat: string
): Promise<AnalysisResult> {
  // ── Case 1: Nothing to analyze ──────────────────────────────────────────────
  if (allCommits.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    return {
      evolution: `# Project Evolution\n\n> ${today}\n\n- No commits found in this repository.`,
      latestCommit: `# Latest Commit Analysis\n\n- No commits found in this repository.`,
    };
  }

  // ── Case 2: No API key ───────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY is not set. Using fallback output.");
    return buildFallback(allCommits);
  }

  // ── Case 3 & 4: Call Gemini ──────────────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The latest commit is always index 0 (git log returns newest-first)
    const latestCommit = allCommits[0];

    console.log(`🤖 Sending ${allCommits.length} commits to Gemini...`);
    const prompt = buildPrompt(allCommits, latestCommit, latestFileStat);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("✅ Gemini response received. Parsing...");
    return parseResponse(rawText);
  } catch (error) {
    console.error("❌ Gemini analysis failed:", (error as Error).message);
    console.warn("⚠️  Falling back to basic output.");
    return buildFallback(allCommits);
  }
}
