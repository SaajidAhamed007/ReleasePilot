import type { connectedRepos, releases } from "@/db/schema";
import type { StructuredRelease } from "@/lib/ai/analyze";
import { renderMarkdownSummary } from "@/lib/ai/analyze";
import type {
  CommitEntry,
  CategorySummary,
  RepositoryInfo,
  ReleaseSummaryInfo,
  ShareReleaseInfo,
  QualityScoreData,
} from "@/types/release";

type ConnectedRepoRow = typeof connectedRepos.$inferSelect;
type ReleaseRow = typeof releases.$inferSelect;

const BREAKDOWN_COLORS: Record<string, string> = {
  Documentation: "#34d399",
  "Test Coverage": "#38bdf8",
  "Code Quality": "#a78bfa",
  Maintainability: "#fb923c",
};
const DEFAULT_BREAKDOWN_COLOR = "#94a3b8";

function withDisplayFields(commit: StructuredRelease["timeline"][number]): CommitEntry {
  return {
    ...commit,
    id: commit.hash,
    avatar: commit.author.slice(0, 2).toUpperCase(),
  };
}

export interface DashboardProps {
  repository: RepositoryInfo;
  releaseSummary: ReleaseSummaryInfo;
  categories: CategorySummary[];
  timeline: CommitEntry[];
  impactModules: StructuredRelease["impactModules"];
  riskAnalysis: StructuredRelease["riskAnalysis"];
  qualityScore: QualityScoreData;
  shareRelease: ShareReleaseInfo;
}

export function buildDashboardProps(
  repo: ConnectedRepoRow,
  release: ReleaseRow
): DashboardProps {
  const structured = release.structuredData as StructuredRelease;

  const categories = structured.categories.map((category) => ({
    ...category,
    commits: category.commits.map(withDisplayFields),
  }));

  const timeline = structured.timeline.map(withDisplayFields);

  const qualityScore: QualityScoreData = {
    overall: structured.qualityScore.overall,
    breakdown: structured.qualityScore.breakdown.map((b) => ({
      ...b,
      color: BREAKDOWN_COLORS[b.label] ?? DEFAULT_BREAKDOWN_COLOR,
    })),
  };

  const repository: RepositoryInfo = {
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
    latestVersion: release.commitSha.slice(0, 7),
    previousVersion: "",
    generatedAt: release.createdAt.toISOString(),
    url: `https://github.com/${repo.fullName}`,
  };

  const markdownPreview = renderMarkdownSummary(repo.fullName, structured);
  const socialPost = [
    `🚀 ReleaseIQ just analyzed ${repo.fullName}!`,
    "",
    ...structured.narrative.highlights.map((h) => `• ${h.text}`),
    "",
    "Full AI-generated release notes ↓",
  ].join("\n");

  return {
    repository,
    releaseSummary: structured.narrative,
    categories,
    timeline,
    impactModules: structured.impactModules,
    riskAnalysis: structured.riskAnalysis,
    qualityScore,
    shareRelease: { socialPost, markdownPreview },
  };
}
