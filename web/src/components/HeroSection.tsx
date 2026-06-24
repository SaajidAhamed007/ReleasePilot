"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Bug,
  RefreshCcw,
  Sparkles,
  GitBranch,
  Clock,
  ArrowRight,
} from "lucide-react";
import { repository, releaseSummary } from "@/data/mock-release";

const iconMap = {
  ShieldCheck,
  Zap,
  Bug,
  RefreshCcw,
};

const formattedDate = new Date(repository.generatedAt).toLocaleString("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100vh] w-full items-center overflow-hidden px-6 pt-28 pb-20 sm:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_55%)]" />
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-10%] bottom-[-10%] h-[36rem] w-[36rem] rounded-full bg-cyan-500/20 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 text-center"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-md"
        >
          <Sparkles className="size-4 text-violet-300" />
          AI-Powered Release Intelligence
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-4xl text-4xl font-bold tracking-tight text-balance text-white sm:text-6xl"
        >
          Release notes that{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            understand your code
          </span>
        </motion.h1>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/60"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
            <GitBranch className="size-3.5 text-cyan-300" />
            {repository.fullName}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
            <Sparkles className="size-3.5 text-violet-300" />
            {repository.latestVersion}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
            <Clock className="size-3.5 text-white/50" />
            Generated {formattedDate}
          </span>
        </motion.div>

        <motion.div
          variants={item}
          className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl shadow-violet-950/30 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-semibold text-white">
              {releaseSummary.headline}
            </h3>
          </div>
          <ul className="flex flex-col gap-3">
            {releaseSummary.highlights.map((h, i) => {
              const Icon = iconMap[h.icon as keyof typeof iconMap];
              return (
                <motion.li
                  key={h.text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/85"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-violet-300">
                    <Icon className="size-4" />
                  </span>
                  {h.text}
                </motion.li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-white/55">
            {releaseSummary.narrative}
          </p>
        </motion.div>

        <motion.a
          variants={item}
          href="#categories"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-lg shadow-white/10 transition-colors hover:bg-white/90"
        >
          Explore the release
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </motion.a>
      </motion.div>
    </section>
  );
}
