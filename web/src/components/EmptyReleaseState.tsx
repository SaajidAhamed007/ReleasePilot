import { Loader2, GitBranch } from "lucide-react";

interface EmptyReleaseStateProps {
  repoFullName: string;
}

export function EmptyReleaseState({ repoFullName }: EmptyReleaseStateProps) {
  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center sm:px-10">
      <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur-xl">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Waiting for your first push</h2>
        <p className="mb-4 text-sm text-white/60">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/70">
            <GitBranch className="size-3 text-cyan-300" />
            {repoFullName}
          </span>
        </p>
        <p className="text-sm text-white/50">
          Push a commit to your default branch and ReleaseIQ will analyze it here automatically.
        </p>
      </div>
    </section>
  );
}
