import { z } from "zod";

export const commitCategorySchema = z.enum(["feature", "fix", "refactor", "docs"]);
export type CommitCategory = z.infer<typeof commitCategorySchema>;

export const aiCommitEntrySchema = z.object({
  hash: z.string(),
  message: z.string(),
  author: z.string(),
  timestamp: z.string(),
  category: commitCategorySchema,
  files: z.array(z.string()),
  aiExplanation: z.string(),
});

export const moduleImpactSchema = z.object({
  name: z.string(),
  filesChanged: z.number(),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export const affectedModuleSchema = z.object({
  name: z.string(),
  reasons: z.array(z.string()),
});

export const qualityBreakdownSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(100),
});

export const riskAnalysisSchema = z.object({
  level: z.enum(["HIGH", "MEDIUM", "LOW"]),
  confidence: z.number().min(0).max(100),
  primaryModule: z.string(),
  reasons: z.array(z.string()),
  affectedModules: z.array(affectedModuleSchema),
});

export const qualityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  breakdown: z.array(qualityBreakdownSchema),
});

export const narrativeSchema = z.object({
  headline: z.string(),
  highlights: z.array(z.object({ icon: z.string(), text: z.string() })),
  narrative: z.string(),
});

export const analysisResultSchema = z.object({
  narrative: narrativeSchema,
  commits: z.array(aiCommitEntrySchema),
  riskAnalysis: riskAnalysisSchema,
  qualityScore: qualityScoreSchema,
  impactModules: z.array(moduleImpactSchema),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const CATEGORY_META: Record<
  CommitCategory,
  { label: string; icon: string; color: string; glow: string }
> = {
  feature: {
    label: "Features",
    icon: "Rocket",
    color: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/40",
  },
  fix: {
    label: "Fixes",
    icon: "Bug",
    color: "from-rose-500 to-orange-400",
    glow: "shadow-rose-500/40",
  },
  refactor: {
    label: "Refactors",
    icon: "RefreshCcw",
    color: "from-sky-500 to-cyan-400",
    glow: "shadow-sky-500/40",
  },
  docs: {
    label: "Documentation",
    icon: "BookOpen",
    color: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/40",
  },
};

// Raw input payload the Action POSTs to /api/analyze
export const ingestionCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
});

export const ingestionDiffSchema = z.object({
  file: z.string(),
  status: z.enum(["added", "modified", "removed", "renamed"]),
  patch: z.string().optional(),
  additions: z.number(),
  deletions: z.number(),
});

export const ingestionPayloadSchema = z.object({
  repoFullName: z.string(),
  commitSha: z.string(),
  ref: z.string(),
  commits: z.array(ingestionCommitSchema),
  diffs: z.array(ingestionDiffSchema),
});

export type IngestionPayload = z.infer<typeof ingestionPayloadSchema>;
