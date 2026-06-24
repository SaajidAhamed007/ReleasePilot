import { execSync } from "child_process";
import { SonarIssue } from "./sonarClient.js";

// Files touched by the most recent commit.
export function lastCommitFiles(): string[] {
  const output = execSync(
    'git show --numstat --format="" HEAD'
  ).toString();

  return output
    .split("\n")
    .filter(Boolean)
    .map(line => line.split("\t")[2])
    .filter(Boolean);
}

// SonarQube reports components as "projectKey:path/to/file".
// Keep only issues whose file changed in the last commit.
export function scopeToLastCommit(
  issues: SonarIssue[],
  changedFiles: string[]
): SonarIssue[] {
  return issues.filter(issue =>
    changedFiles.some(file =>
      issue.component.endsWith(`:${file}`) ||
      issue.component.endsWith(file)
    )
  );
}
