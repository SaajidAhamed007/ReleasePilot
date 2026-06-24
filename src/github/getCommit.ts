import { execSync } from "child_process";

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export function getCommits(): Commit[] {
  const output = execSync(
    'git log -10 --pretty=format:"%H|%s|%an|%ad"'
  ).toString();

  return output
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const [sha, message, author, date] =
        line.split("|");

      return {
        sha,
        message,
        author,
        date
      };
    });
}