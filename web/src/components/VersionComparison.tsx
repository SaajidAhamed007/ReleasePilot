"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PlusCircle, MinusCircle, PencilLine, FileDiff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableVersions, versionComparisons } from "@/data/mock-release";
import { SectionHeading } from "./SectionHeading";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer-continued"), {
  ssr: false,
});

const diffStyles = {
  variables: {
    dark: {
      diffViewerBackground: "transparent",
      diffViewerColor: "#e5e7eb",
      addedBackground: "rgba(52,211,153,0.12)",
      addedColor: "#6ee7b7",
      removedBackground: "rgba(251,113,133,0.12)",
      removedColor: "#fda4af",
      wordAddedBackground: "rgba(52,211,153,0.3)",
      wordRemovedBackground: "rgba(251,113,133,0.3)",
      gutterBackground: "transparent",
      gutterBackgroundDark: "transparent",
      highlightBackground: "rgba(255,255,255,0.03)",
      highlightGutterBackground: "rgba(255,255,255,0.03)",
      codeFoldGutterBackground: "transparent",
      codeFoldBackground: "rgba(255,255,255,0.03)",
      emptyLineBackground: "transparent",
      gutterColor: "rgba(255,255,255,0.3)",
      addedGutterBackground: "rgba(52,211,153,0.08)",
      removedGutterBackground: "rgba(251,113,133,0.08)",
      codeFoldContentColor: "rgba(255,255,255,0.4)",
      diffViewerTitleBackground: "transparent",
      diffViewerTitleColor: "rgba(255,255,255,0.5)",
      diffViewerTitleBorderColor: "rgba(255,255,255,0.08)",
    },
  },
  contentText: { fontSize: "12.5px" },
};

export function VersionComparison() {
  const [previous, setPrevious] = useState("v2.3.0");
  const [current, setCurrent] = useState("v2.4.0");

  const key = `${previous}->${current}`;
  const diff = useMemo(
    () => versionComparisons[key] ?? versionComparisons["v2.3.0->v2.4.0"],
    [key]
  );

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Version Comparison"
        title="Diff any two releases"
        description="Pick two versions to see what was added, removed, and modified — down to the line."
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Previous</span>
          <Select value={previous} onValueChange={(v) => v && setPrevious(v)}>
            <SelectTrigger className="w-32 border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-white/30">→</span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Current</span>
          <Select value={current} onValueChange={(v) => v && setCurrent(v)}>
            <SelectTrigger className="w-32 border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        key={key}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-3"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-300">
            <PlusCircle className="size-3.5" />
            Added
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-white/70">
            {diff.added.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-rose-300">
            <MinusCircle className="size-3.5" />
            Removed
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-white/70">
            {diff.removed.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-300">
            <PencilLine className="size-3.5" />
            Modified
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-white/70">
            {diff.modified.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div
        key={`${key}-diff`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/50">
          <FileDiff className="size-3.5" />
          <span className="font-mono">{diff.fileName}</span>
        </div>
        <div className="overflow-x-auto text-xs">
          <ReactDiffViewer
            oldValue={diff.oldCode}
            newValue={diff.newCode}
            splitView
            useDarkTheme
            disableWorker
            styles={diffStyles}
          />
        </div>
      </motion.div>
    </section>
  );
}
