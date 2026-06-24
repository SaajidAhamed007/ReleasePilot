"use client";

import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import type { QualityScoreData } from "@/types/release";
import { SectionHeading } from "./SectionHeading";
import { useCountUp } from "@/hooks/use-count-up";

const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularScore({ score }: { score: number }) {
  const { ref, value } = useCountUp(score, 1.6);
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <div ref={ref as never} className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
          fill="none"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#scoreGradient)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums text-white">{value}</span>
        <span className="text-sm text-white/40">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownRow({ label, score, color, delay }: { label: string; score: number; color: string; delay: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-medium text-white">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface QualityScoreProps {
  qualityScore: QualityScoreData;
}

export function QualityScore({ qualityScore }: QualityScoreProps) {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Release Quality Score"
        title="One number that says it's ready"
        description="Composite score across documentation, tests, code quality, and maintainability."
        align="center"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-12"
      >
        <div className="absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/10 via-cyan-400/10 to-emerald-400/10 blur-3xl" />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3 justify-self-center">
            <CircularScore score={qualityScore.overall} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <Sparkle className="size-3.5 text-violet-300" />
              Excellent release
            </span>
          </div>

          <div className="flex w-full flex-col gap-5">
            {qualityScore.breakdown.map((b, i) => (
              <BreakdownRow
                key={b.label}
                label={b.label}
                score={b.score}
                color={b.color}
                delay={i * 0.15}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
