"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileCode2, Sparkles, Rocket, Bug, RefreshCcw, BookOpen } from "lucide-react";
import type { CommitCategory, CommitEntry } from "@/types/release";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

const categoryStyles: Record<CommitCategory, { icon: typeof Rocket; color: string; label: string }> = {
  feature: { icon: Rocket, color: "text-violet-300 bg-violet-500/15", label: "Feature" },
  fix: { icon: Bug, color: "text-rose-300 bg-rose-500/15", label: "Fix" },
  refactor: { icon: RefreshCcw, color: "text-sky-300 bg-sky-500/15", label: "Refactor" },
  docs: { icon: BookOpen, color: "text-emerald-300 bg-emerald-500/15", label: "Docs" },
};

interface ChangeTimelineProps {
  timeline: CommitEntry[];
}

export function ChangeTimeline({ timeline }: ChangeTimelineProps) {
  const [openId, setOpenId] = useState<string | null>(timeline[0]?.id ?? null);

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="AI Change Timeline"
        title="A play-by-play of the release"
        description="Each commit interpreted by AI, with the files it touched and what it actually means."
      />

      <div className="relative flex flex-col gap-4 pl-2">
        <div className="absolute top-2 bottom-2 left-[27px] w-px bg-gradient-to-b from-violet-500/40 via-white/10 to-transparent sm:left-[31px]" />

        {timeline.map((commit, i) => {
          const style = categoryStyles[commit.category];
          const Icon = style.icon;
          const isOpen = openId === commit.id;

          return (
            <motion.div
              key={commit.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="relative flex gap-4"
            >
              <span
                className={cn(
                  "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-[#0a0a0f] sm:size-10",
                  style.color
                )}
              >
                <Icon className="size-4" />
              </span>

              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <button
                  onClick={() => setOpenId(isOpen ? null : commit.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className={cn("rounded-full px-2 py-0.5 font-medium", style.color)}>
                        {style.label}
                      </span>
                      <span>
                        {new Date(commit.timestamp).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="truncate font-mono text-sm text-white/85">
                      {commit.message}
                    </p>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 text-white/40"
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="flex flex-col gap-4 px-5 py-4">
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-4">
                          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-violet-300">
                            <Sparkles className="size-3.5" />
                            AI Interpretation
                          </div>
                          <p className="text-sm leading-relaxed text-white/75">
                            {commit.aiExplanation}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-white/40">
                            <FileCode2 className="size-3.5" />
                            Changed Files
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {commit.files.map((f) => (
                              <span
                                key={f}
                                className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-xs text-white/60"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-white/35">
                          {commit.author} · {commit.hash}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
