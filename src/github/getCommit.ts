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