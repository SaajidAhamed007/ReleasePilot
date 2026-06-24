import { execSync } from "child_process";

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

// Parses "SHA|message|author|date" lines into Commit objects
function parseGitLog(output: string): Commit[] {
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, message, author, date] = line.split("|");
      return { sha, message, author, date };
    });
}

// Original function — kept for backward compatibility
export function getCommits(): Commit[] {
  const output = execSync(
    'git log -10 --pretty=format:"%H|%s|%an|%ad"'
  ).toString();
  return parseGitLog(output);
}

// Fetches up to `limit` commits (default 100) for full project evolution analysis.
// Returns commits newest-first (standard git log order).
export function getAllCommits(limit = 100): Commit[] {
  const output = execSync(
    `git log -${limit} --pretty=format:"%H|%s|%an|%ad"`
  ).toString();
  return parseGitLog(output);
}

// Returns the file-change statistics for the most recent commit.
// Example output:
//   src/ai/analyzer.ts | 42 ++++++++++++--
//   src/index.ts       |  8 ++--
//   2 files changed, 46 insertions(+), 4 deletions(-)
export function getLatestCommitStat(): string {
  try {
    return execSync("git diff-tree --no-commit-id -r --stat HEAD")
      .toString()
      .trim();
  } catch {
    return "File change statistics unavailable.";
  }
}

export interface FileDiff {
  file: string;
  status: "added" | "modified" | "removed" | "renamed";
  patch: string;
  additions: number;
  deletions: number;
}

const MAX_PATCH_CHARS = 3000;

// Returns per-file diffs (status, patch, line counts) for the most recent
// commit. Used to give the AI real diff content instead of just file names.
export function getLatestCommitDiffs(): FileDiff[] {
  try {
    const nameStatusOutput = execSync(
      "git diff-tree --no-commit-id -r --name-status HEAD"
    ).toString();
    const numstatOutput = execSync(
      "git diff-tree --no-commit-id -r --numstat HEAD"
    ).toString();
    const patchOutput = execSync(
      "git diff-tree --no-commit-id -r -p HEAD"
    ).toString();

    const statusMap = new Map<string, FileDiff["status"]>();
    for (const line of nameStatusOutput.split("\n").filter(Boolean)) {
      const parts = line.split("\t");
      const code = parts[0];
      const filePath = parts[parts.length - 1];
      let status: FileDiff["status"] = "modified";
      if (code.startsWith("A")) status = "added";
      else if (code.startsWith("D")) status = "removed";
      else if (code.startsWith("R")) status = "renamed";
      statusMap.set(filePath, status);
    }

    const statsMap = new Map<string, { additions: number; deletions: number }>();
    for (const line of numstatOutput.split("\n").filter(Boolean)) {
      const [add, del, filePath] = line.split("\t");
      statsMap.set(filePath, {
        additions: add === "-" ? 0 : parseInt(add, 10),
        deletions: del === "-" ? 0 : parseInt(del, 10),
      });
    }

    const patchMap = new Map<string, string>();
    for (const chunk of patchOutput.split(/^diff --git /m).filter(Boolean)) {
      const firstLine = chunk.split("\n")[0];
      const match = firstLine.match(/a\/(.+?) b\/(.+)$/);
      const filePath = match ? match[2] : firstLine.trim();
      const fullPatch = "diff --git " + chunk;
      patchMap.set(
        filePath,
        fullPatch.length > MAX_PATCH_CHARS
          ? fullPatch.slice(0, MAX_PATCH_CHARS) + "\n... (truncated)"
          : fullPatch
      );
    }

    const files = new Set([...statusMap.keys(), ...statsMap.keys()]);
    return Array.from(files).map((file) => ({
      file,
      status: statusMap.get(file) ?? "modified",
      patch: patchMap.get(file) ?? "",
      additions: statsMap.get(file)?.additions ?? 0,
      deletions: statsMap.get(file)?.deletions ?? 0,
    }));
  } catch {
    return [];
  }
}