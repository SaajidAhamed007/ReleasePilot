"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Loader2, GitPullRequest, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoOption {
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

type Status =
  | { state: "loading-repos" }
  | { state: "picking"; repos: RepoOption[] }
  | { state: "connecting"; repo: RepoOption }
  | { state: "connected"; prUrl: string }
  | { state: "error"; message: string };

export function ConnectRepoFlow() {
  const [status, setStatus] = useState<Status>({ state: "loading-repos" });

  useEffect(() => {
    fetch("/api/repos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus({ state: "error", message: data.error });
        } else {
          setStatus({ state: "picking", repos: data.repos });
        }
      })
      .catch(() => setStatus({ state: "error", message: "Failed to load repositories." }));
  }, []);

  const handleConnect = async (repo: RepoOption) => {
    setStatus({ state: "connecting", repo });
    try {
      const res = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, name: repo.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ state: "error", message: data.error ?? "Failed to connect repository." });
        return;
      }
      setStatus({ state: "connected", prUrl: data.prUrl });
    } catch {
      setStatus({ state: "error", message: "Failed to connect repository." });
    }
  };

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center sm:px-10">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-violet-300 uppercase backdrop-blur-sm">
        Connect Your Repository
      </span>
      <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Bring ReleaseIQ to your codebase
      </h2>
      <p className="mb-10 max-w-md text-white/60">
        Pick a repository you administer. We&apos;ll open a pull request that adds the
        ReleaseIQ workflow — merge it and your next push to main starts the magic.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8"
      >
        {status.state === "loading-repos" && (
          <div className="flex flex-col items-center gap-3 py-10 text-white/50">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading your repositories…</p>
          </div>
        )}

        {status.state === "picking" && (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto text-left">
            {status.repos.length === 0 && (
              <p className="py-8 text-center text-sm text-white/50">
                No repositories found where you have admin access.
              </p>
            )}
            {status.repos.map((repo) => (
              <button
                key={repo.githubRepoId}
                onClick={() => handleConnect(repo)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-violet-400/30 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="size-4 text-white/40" />
                  <div>
                    <p className="text-sm font-medium text-white">{repo.fullName}</p>
                    <p className="text-xs text-white/40">
                      {repo.private ? "Private" : "Public"} · {repo.defaultBranch}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-violet-300" />
              </button>
            ))}
          </div>
        )}

        {status.state === "connecting" && (
          <div className="flex flex-col items-center gap-3 py-10 text-white/70">
            <Loader2 className="size-6 animate-spin text-violet-300" />
            <p className="text-sm">
              Connecting <span className="font-medium text-white">{status.repo.fullName}</span>…
            </p>
            <p className="text-xs text-white/40">Setting up secrets and opening a pull request</p>
          </div>
        )}

        {status.state === "connected" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <GitPullRequest className="size-6" />
            </span>
            <p className="text-sm text-white/80">
              Pull request opened. Merge it to finish connecting your repository.
            </p>
            <a
              href={status.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              View pull request
              <ArrowRight className="size-4" />
            </a>
          </div>
        )}

        {status.state === "error" && (
          <div
            className={cn(
              "flex flex-col items-center gap-3 py-8 text-center",
              "text-rose-300"
            )}
          >
            <AlertCircle className="size-6" />
            <p className="text-sm">{status.message}</p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
