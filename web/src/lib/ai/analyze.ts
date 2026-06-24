import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  analysisResultSchema,
  CATEGORY_META,
  type AnalysisResult,
  type CommitCategory,
  type IngestionPayload,
} from "./schema";
import { buildAnalysisPrompt } from "./prompt";

export interface CategorySummary {
  key: CommitCategory;
  label: string;
  icon: string;
  color: string;
  glow: string;
  count: number;
  commits: AnalysisResult["commits"];
}

export interface StructuredRelease {
  narrative: AnalysisResult["narrative"];
  categories: CategorySummary[];
  timeline: AnalysisResult["commits"];
  riskAnalysis: AnalysisResult["riskAnalysis"];
  qualityScore: AnalysisResult["qualityScore"];
  impactModules: AnalysisResult["impactModules"];
}

const CATEGORY_ORDER: CommitCategory[] = ["feature", "fix", "refactor", "docs"];

function deriveCategories(commits: AnalysisResult["commits"]): CategorySummary[] {
  const grouped = new Map<CommitCategory, AnalysisResult["commits"]>(
    CATEGORY_ORDER.map((key) => [key, []])
  );
  for (const commit of commits) {
    grouped.get(commit.category)?.push(commit);
  }
  return CATEGORY_ORDER.map((key) => ({
    key,
    ...CATEGORY_META[key],
    count: grouped.get(key)!.length,
    commits: grouped.get(key)!,
  }));
}

function deriveTimeline(commits: AnalysisResult["commits"]): AnalysisResult["commits"] {
  return [...commits].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function categorizeByPrefix(message: string): CommitCategory {
  const m = message.toLowerCase();
  if (/^feat(\(|:)/.test(m)) return "feature";
  if (/^fix(\(|:)/.test(m)) return "fix";
  if (/^refactor(\(|:)/.test(m)) return "refactor";
  if (/^docs(\(|:)/.test(m)) return "docs";
  if (/\bfix(ed|es)?\b/.test(m)) return "fix";
  if (/\brefactor/.test(m)) return "refactor";
  if (/\bdocs?\b/.test(m)) return "docs";
  return "feature";
}

function buildFallback(payload: IngestionPayload): AnalysisResult {
  return {
    narrative: {
      headline: "Release Summary",
      highlights: payload.commits.slice(0, 4).map((c) => ({
        icon: "GitCommitHorizontal",
        text: c.message,
      })),
      narrative: `This release includes ${payload.commits.length} commit(s). AI analysis was unavailable, so this is a basic summary derived from commit messages.`,
    },
    commits: payload.commits.map((c) => ({
      hash: c.sha,
      message: c.message,
      author: c.author,
      timestamp: c.date,
      category: categorizeByPrefix(c.message),
      files: [],
      aiExplanation: c.message,
    })),
    riskAnalysis: {
      level: "MEDIUM",
      confidence: 50,
      primaryModule: "Unknown",
      reasons: ["AI analysis was unavailable; risk could not be assessed."],
      affectedModules: [],
    },
    qualityScore: {
      overall: 70,
      breakdown: [
        { label: "Documentation", score: 70 },
        { label: "Test Coverage", score: 70 },
        { label: "Code Quality", score: 70 },
        { label: "Maintainability", score: 70 },
      ],
    },
    impactModules: [],
  };
}

export interface AnalyzeOutcome {
  result: StructuredRelease;
  markdownSummary: string;
  usedFallback: boolean;
}

export async function analyzeRelease(payload: IngestionPayload): Promise<AnalyzeOutcome> {
  let analysis: AnalysisResult;
  let usedFallback = false;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    analysis = buildFallback(payload);
    usedFallback = true;
  } else {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(buildAnalysisPrompt(payload));
      const parsed = JSON.parse(result.response.text());
      const validated = analysisResultSchema.safeParse(parsed);
      if (!validated.success) {
        throw new Error(`AI response failed validation: ${validated.error.message}`);
      }
      analysis = validated.data;
    } catch (error) {
      console.error("Gemini analysis failed, using fallback:", error);
      analysis = buildFallback(payload);
      usedFallback = true;
    }
  }

  const structured: StructuredRelease = {
    narrative: analysis.narrative,
    categories: deriveCategories(analysis.commits),
    timeline: deriveTimeline(analysis.commits),
    riskAnalysis: analysis.riskAnalysis,
    qualityScore: analysis.qualityScore,
    impactModules: analysis.impactModules,
  };

  return {
    result: structured,
    markdownSummary: renderMarkdownSummary(payload, structured),
    usedFallback,
  };
}

export function renderMarkdownSummary(
  payload: IngestionPayload,
  structured: StructuredRelease
): string {
  const lines: string[] = [];
  lines.push(`# ${payload.repoFullName}`);
  lines.push("");
  lines.push(`## ${structured.narrative.headline}`);
  lines.push("");
  lines.push(structured.narrative.narrative);
  lines.push("");

  for (const category of structured.categories) {
    if (category.commits.length === 0) continue;
    lines.push(`## ${category.label}`);
    for (const commit of category.commits) {
      lines.push(`- ${commit.message} (${commit.hash.slice(0, 7)})`);
    }
    lines.push("");
  }

  lines.push("## Risk Analysis");
  lines.push(`**${structured.riskAnalysis.level} RISK** (confidence: ${structured.riskAnalysis.confidence}%)`);
  for (const reason of structured.riskAnalysis.reasons) {
    lines.push(`- ${reason}`);
  }

  return lines.join("\n");
}
