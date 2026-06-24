"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Gauge, Boxes } from "lucide-react";
import type { RiskAnalysisData } from "@/types/release";
import { SectionHeading } from "./SectionHeading";
import { Badge } from "@/components/ui/badge";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

const levelStyles = {
  HIGH: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    ring: "from-rose-500 to-orange-400",
    glow: "shadow-rose-500/30",
  },
  MEDIUM: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ring: "from-amber-400 to-yellow-300",
    glow: "shadow-amber-500/30",
  },
  LOW: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    ring: "from-emerald-400 to-teal-300",
    glow: "shadow-emerald-500/30",
  },
};

interface RiskAnalysisProps {
  riskAnalysis: RiskAnalysisData;
}

export function RiskAnalysis({ riskAnalysis }: RiskAnalysisProps) {
  // AI output casing can drift - normalize defensively so an unexpected value
  // never crashes the render with levelStyles[undefined].
  const normalizedLevel = (["HIGH", "MEDIUM", "LOW"] as const).includes(
    riskAnalysis.level
  )
    ? riskAnalysis.level
    : "MEDIUM";
  const style = levelStyles[normalizedLevel];
  const { ref, value } = useCountUp(riskAnalysis.confidence, 1.4);

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Risk Analysis"
        title="Should you ship this with confidence?"
        description="ReleaseIQ scores release risk from commit semantics, not just diff size."
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10",
          "shadow-2xl",
          style.glow
        )}
      >
        <div
          className={cn(
            "absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
            style.ring
          )}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn("border px-3 py-1 text-sm font-semibold", style.badge)}>
                <ShieldAlert className="size-3.5" />
                {normalizedLevel} RISK
              </Badge>
              <span className="text-white/40">·</span>
              <h3 className="text-lg font-semibold text-white">
                {riskAnalysis.primaryModule}
              </h3>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-white/40 uppercase">
                <AlertTriangle className="size-3.5" />
                Reason
              </p>
              <ul className="flex flex-col gap-2">
                {riskAnalysis.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white/75"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-white/40 uppercase">
                <Boxes className="size-3.5" />
                Affected Modules
              </p>
              <div className="flex flex-wrap gap-2">
                {riskAnalysis.affectedModules.map((m) => (
                  <span
                    key={m.name}
                    title={m.reasons.join(", ")}
                    className="cursor-default rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-8">
            <Gauge className="size-5 text-white/40" />
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Confidence
            </p>
            <p ref={ref as never} className="text-5xl font-bold tabular-nums text-white">
              {value}%
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${riskAnalysis.confidence}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={cn("h-full rounded-full bg-gradient-to-r", style.ring)}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
