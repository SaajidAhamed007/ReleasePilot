"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rocket, Bug, RefreshCcw, BookOpen, ChevronDown, GitCommitHorizontal } from "lucide-react";
import type { CategorySummary } from "@/types/release";
import { SectionHeading } from "./SectionHeading";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

const iconMap = { Rocket, Bug, RefreshCcw, BookOpen };

function CategoryCard({ category, index }: { category: CategorySummary; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { ref, value } = useCountUp(category.count, 1.4);
  const Icon = iconMap[category.icon as keyof typeof iconMap];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-shadow",
        "hover:shadow-2xl",
        category.glow
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-20",
          category.color
        )}
      />

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full flex-col gap-4 text-left"
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
              category.color
            )}
          >
            <Icon className="size-5" />
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/40"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </div>

        <div ref={ref as never}>
          <p className="text-3xl font-semibold text-white tabular-nums">{value}</p>
          <p className="mt-1 text-sm font-medium text-white/60">{category.label}</p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
              {category.commits.map((commit) => (
                <div
                  key={commit.id}
                  className="rounded-lg border border-white/5 bg-black/20 p-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-white/70">
                    <GitCommitHorizontal className="size-3.5 text-white/40" />
                    <span className="font-mono text-white/40">{commit.hash}</span>
                    <span className="truncate">{commit.message}</span>
                  </div>
                  <p className="mt-1.5 pl-5 text-white/45">{commit.author}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface CategoryCardsProps {
  categories: CategorySummary[];
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  return (
    <section id="categories" className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Category Insights"
        title="What changed, at a glance"
        description="Every commit in this release, automatically classified and counted by ReleaseIQ."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, i) => (
          <CategoryCard key={category.key} category={category} index={i} />
        ))}
      </div>
    </section>
  );
}
