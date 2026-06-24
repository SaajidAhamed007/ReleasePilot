"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = buildPrompt;
/**
 * Formats commits in chronological order (oldest → newest) as a numbered list.
 * Gemini reads this to understand how the project evolved over time.
 *
 * Example line:
 *   1. [abc1234] chore: initial setup — by Alice on Mon Jan 01 2024
 */
function formatAllCommits(commits) {
    // git log returns newest-first; reverse so Gemini reads oldest-first (chronological)
    return [...commits]
        .reverse()
        .map((c, i) => `${i + 1}. [${c.sha.slice(0, 7)}] ${c.message} — by ${c.author} on ${c.date}`)
        .join("\n");
}
/**
 * Builds the prompt that Gemini uses to generate BOTH output documents.
 *
 * @param allCommits     - Full commit history (for the evolution document)
 * @param latestCommit   - The single most recent commit (for the detail document)
 * @param latestFileStat - Output of `git diff-tree --stat HEAD` (files changed in latest commit)
 */
function buildPrompt(allCommits, latestCommit, latestFileStat) {
    const today = new Date().toISOString().split("T")[0];
    const chronologicalCommits = formatAllCommits(allCommits);
    const totalCommits = allCommits.length;
    return `You are a professional technical writer analyzing a Git repository's full history.

Today's date: ${today}
Total commits in history: ${totalCommits}

You will generate TWO separate Markdown documents.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION A — DATA FOR DOCUMENT 1 (Project Evolution)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All commits listed chronologically (oldest → newest):

${chronologicalCommits}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION B — DATA FOR DOCUMENT 2 (Latest Commit Deep Dive)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Latest commit details:
  SHA     : ${latestCommit.sha}
  Author  : ${latestCommit.author}
  Date    : ${latestCommit.date}
  Message : ${latestCommit.message}

Files changed in this commit:
${latestFileStat || "No file statistics available."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS FOR DOCUMENT 1 — PROJECT_EVOLUTION.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write a concise, human-readable story of how this project has grown.
A non-technical stakeholder should be able to read this and understand the project's journey.

Include these sections:

## Project Overview
One short paragraph: what this project does, inferred from the commit history.

## How the Project Evolved
Group commits into logical phases (e.g., "Initial Setup", "Core Features", "AI Integration").
For each phase, write 2–4 bullet points describing what was built or changed.
Keep each bullet short — one clear sentence.

## Feature Changes Over Time
A focused list of what features exist now vs. what was there at the start.
Format as:
  ✦ [Feature name] — short description of what changed

## Workflow Changes
Describe how the automated pipeline or workflow behaviour changed across the history.
Example: "Initially the pipeline generated placeholder files. Now it calls Gemini AI to produce real release notes."

## Current State
2–3 sentences on what the project does RIGHT NOW at its latest commit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS FOR DOCUMENT 2 — LATEST_COMMIT.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write a detailed technical breakdown of ONLY the latest commit.
A developer who didn't write this commit should be able to read this and fully understand what changed.

Include these sections:

## Commit Summary
**Commit:** \`${latestCommit.sha.slice(0, 7)}\`
**Author:** ${latestCommit.author}
**Date:** ${latestCommit.date}
**Type:** [categorize as: Feature / Bug Fix / Refactor / Docs / Breaking Change / Chore]

One paragraph explaining what this commit does in plain English.

## Files Changed
For EACH file listed in the stats above, write:
  - \`<filename>\` — what this file does and what specifically changed in it

If no file stats are available, infer from the commit message which files were likely changed.

## How the Workflow Changes
### Before This Commit
Describe the system's behaviour BEFORE this commit was applied (infer from earlier commits).

### After This Commit
Describe the system's behaviour NOW, after this commit.

## Impact Assessment
- **Risk Level:** [Low / Medium / High] — explain why in one sentence
- **Affects:** [list areas: e.g., CI/CD pipeline, API calls, file output, authentication]
- **Breaking Change:** [Yes / No] — if Yes, explain what breaks

## What Developers Should Know
2–4 bullet points: things a developer needs to do, watch out for, or verify after pulling this commit.
Examples: "Run npm install if new packages were added", "Set the GEMINI_API_KEY environment variable", etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — STRICT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return EXACTLY this structure. Nothing before ===EVOLUTION===. Nothing after the last line of ===LATEST_COMMIT===.

===EVOLUTION===
# Project Evolution

[Document 1 content here — following the instructions above]

===LATEST_COMMIT===
# Latest Commit Analysis

[Document 2 content here — following the instructions above]

RULES:
- Do NOT include commit SHAs or author names in bullet points (except in the Commit Summary header).
- Do NOT use phrases like "Based on the commits..." or "As we can see...".
- Write in active voice. Be direct and concise.
- Every section heading must appear even if there is little to say.
- No trailing commentary after the last section.`;
}
//# sourceMappingURL=prompt.js.map