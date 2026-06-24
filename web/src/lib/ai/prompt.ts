import type { IngestionPayload } from "./schema";

export function buildAnalysisPrompt(payload: IngestionPayload): string {
  const { commits, diffs } = payload;

  const commitList = commits
    .map((c, i) => `${i + 1}. [${c.sha.slice(0, 7)}] ${c.message} — by ${c.author} on ${c.date}`)
    .join("\n");

  const diffSummary = diffs
    .map((d) => {
      const header = `${d.status.toUpperCase()} ${d.file} (+${d.additions}/-${d.deletions})`;
      return d.patch ? `${header}\n${d.patch}` : header;
    })
    .join("\n\n");

  return `You are ReleaseIQ, an AI that analyzes Git commits and produces structured release intelligence.

Repository: ${payload.repoFullName}
Ref: ${payload.ref}
Latest commit: ${payload.commitSha}

COMMIT HISTORY (newest first):
${commitList}

DIFF FOR THE LATEST COMMIT:
${diffSummary || "(no diff content available)"}

Analyze this release and respond with ONLY a JSON object (no markdown fences, no prose) matching exactly this shape:

{
  "narrative": {
    "headline": "Release Summary",
    "highlights": [{ "icon": "lucide-icon-name", "text": "short highlight" }],
    "narrative": "2-3 sentence prose summary of the release"
  },
  "commits": [
    {
      "hash": "full commit sha, copied from the commit history above",
      "message": "commit message",
      "author": "author name",
      "timestamp": "ISO 8601 date",
      "category": "feature" | "fix" | "refactor" | "docs",
      "files": ["file paths touched by this commit, best guess if unknown"],
      "aiExplanation": "1-2 sentence plain-English explanation of what this commit actually does and why it matters"
    }
  ],
  "riskAnalysis": {
    "level": "HIGH" | "MEDIUM" | "LOW",
    "confidence": 0-100,
    "primaryModule": "the module/area most at risk",
    "reasons": ["specific reasons this release is risky or safe"],
    "affectedModules": [{ "name": "module name", "reasons": ["why this module is affected"] }]
  },
  "qualityScore": {
    "overall": 0-100,
    "breakdown": [
      { "label": "Documentation", "score": 0-100 },
      { "label": "Test Coverage", "score": 0-100 },
      { "label": "Code Quality", "score": 0-100 },
      { "label": "Maintainability", "score": 0-100 }
    ]
  },
  "impactModules": [
    { "name": "module/area name inferred from file paths", "filesChanged": <count>, "riskLevel": "low" | "medium" | "high" }
  ]
}

Rules:
- Classify EVERY commit in the history into exactly one category based on its message and content (use conventional commit prefixes like feat/fix/refactor/docs as a strong signal when present).
- Infer "modules" from file path directories (e.g. src/auth/* -> "Authentication"). Group related paths under the same module name consistently.
- Be honest about risk - do not default to LOW just to be agreeable. Touching auth, payments, or session handling is inherently higher risk.
- Output valid JSON only. Do not wrap it in markdown code fences.`;
}
