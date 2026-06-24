import { HeroSection } from "@/components/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";
import { ChangeTimeline } from "@/components/ChangeTimeline";
import { ImpactHeatmap } from "@/components/ImpactHeatmap";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { QualityScore } from "@/components/QualityScore";
import { VersionComparison } from "@/components/VersionComparison";
import { ShareRelease } from "@/components/ShareRelease";
import { AIChat } from "@/components/AIChat";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f]">
      <HeroSection />
      <CategoryCards />
      <ChangeTimeline />
      <ImpactHeatmap />
      <RiskAnalysis />
      <QualityScore />
      <VersionComparison />
      <ShareRelease />
      <AIChat />
    </div>
  );
}
