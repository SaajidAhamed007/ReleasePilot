import { and, desc, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedRepos, releases } from "@/db/schema";
import { buildDashboardProps } from "@/lib/get-dashboard-data";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";
import { ChangeTimeline } from "@/components/ChangeTimeline";
import { ImpactHeatmap } from "@/components/ImpactHeatmap";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { QualityScore } from "@/components/QualityScore";
import { VersionComparison } from "@/components/VersionComparison";
import { ShareRelease } from "@/components/ShareRelease";
import { AIChat } from "@/components/AIChat";
import { ConnectRepoFlow } from "@/components/ConnectRepoFlow";
import { EmptyReleaseState } from "@/components/EmptyReleaseState";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  repository as mockRepository,
  releaseSummary as mockReleaseSummary,
  categories as mockCategories,
  timeline as mockTimeline,
  impactModules as mockImpactModules,
  riskAnalysis as mockRiskAnalysis,
  qualityScore as mockQualityScore,
  shareRelease as mockShareRelease,
} from "@/data/mock-release";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0a0f]">
        <DashboardHeader />
        <HeroSection repository={mockRepository} releaseSummary={mockReleaseSummary} />
        <CategoryCards categories={mockCategories} />
        <ChangeTimeline timeline={mockTimeline} />
        <ImpactHeatmap impactModules={mockImpactModules} />
        <RiskAnalysis riskAnalysis={mockRiskAnalysis} />
        <QualityScore qualityScore={mockQualityScore} />
        <VersionComparison />
        <ShareRelease repository={mockRepository} shareRelease={mockShareRelease} />
        <AIChat />
      </div>
    );
  }

  const [repo] = await db
    .select()
    .from(connectedRepos)
    .where(
      and(eq(connectedRepos.userId, session.user.id), ne(connectedRepos.status, "revoked"))
    )
    .orderBy(desc(connectedRepos.updatedAt))
    .limit(1);

  if (!repo) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0a0f]">
        <DashboardHeader />
        <ConnectRepoFlow />
      </div>
    );
  }

  const [release] = await db
    .select()
    .from(releases)
    .where(and(eq(releases.repoId, repo.id), eq(releases.status, "completed")))
    .orderBy(desc(releases.createdAt))
    .limit(1);

  if (!release || !release.structuredData) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0a0f]">
        <DashboardHeader />
        <EmptyReleaseState repoFullName={repo.fullName} />
      </div>
    );
  }

  const props = buildDashboardProps(repo, release);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f]">
      <DashboardHeader />
      <HeroSection repository={props.repository} releaseSummary={props.releaseSummary} />
      <CategoryCards categories={props.categories} />
      <ChangeTimeline timeline={props.timeline} />
      <ImpactHeatmap impactModules={props.impactModules} />
      <RiskAnalysis riskAnalysis={props.riskAnalysis} />
      <QualityScore qualityScore={props.qualityScore} />
      <VersionComparison />
      <ShareRelease repository={props.repository} shareRelease={props.shareRelease} />
      <AIChat />
    </div>
  );
}
