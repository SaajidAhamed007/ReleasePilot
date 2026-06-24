export type CommitCategory = "feature" | "fix" | "refactor" | "docs";

export interface CommitEntry {
  id: string;
  hash: string;
  message: string;
  author: string;
  avatar: string;
  timestamp: string;
  category: CommitCategory;
  files: string[];
  aiExplanation: string;
}

export interface CategorySummary {
  key: CommitCategory;
  label: string;
  icon: string;
  count: number;
  color: string;
  glow: string;
  commits: CommitEntry[];
}

export interface ModuleImpact {
  name: string;
  filesChanged: number;
  riskLevel: "low" | "medium" | "high";
}

export interface AffectedModule {
  name: string;
  reasons: string[];
}

export interface QualityBreakdown {
  label: string;
  score: number;
  color: string;
}

export interface VersionDiff {
  version: string;
  fileName: string;
  oldCode: string;
  newCode: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export interface ChatExample {
  question: string;
  answer: string;
}

export interface RepositoryInfo {
  owner: string;
  name: string;
  fullName: string;
  latestVersion: string;
  previousVersion: string;
  generatedAt: string;
  url: string;
}

export interface ReleaseSummaryInfo {
  headline: string;
  highlights: Array<{ icon: string; text: string }>;
  narrative: string;
}

export interface RiskAnalysisData {
  level: "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  primaryModule: string;
  reasons: string[];
  affectedModules: AffectedModule[];
}

export interface QualityScoreData {
  overall: number;
  breakdown: QualityBreakdown[];
}

export interface ShareReleaseInfo {
  socialPost: string;
  markdownPreview: string;
}
