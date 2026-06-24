"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommits = getCommits;
exports.getAllCommits = getAllCommits;
exports.getLatestCommitStat = getLatestCommitStat;
const child_process_1 = require("child_process");
// Parses "SHA|message|author|date" lines into Commit objects
function parseGitLog(output) {
    return output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
        const [sha, message, author, date] = line.split("|");
        return { sha, message, author, date };
    });
}
// Original function — kept for backward compatibility
function getCommits() {
    const output = (0, child_process_1.execSync)('git log -10 --pretty=format:"%H|%s|%an|%ad"').toString();
    return parseGitLog(output);
}
// Fetches up to `limit` commits (default 100) for full project evolution analysis.
// Returns commits newest-first (standard git log order).
function getAllCommits(limit = 100) {
    const output = (0, child_process_1.execSync)(`git log -${limit} --pretty=format:"%H|%s|%an|%ad"`).toString();
    return parseGitLog(output);
}
// Returns the file-change statistics for the most recent commit.
// Example output:
//   src/ai/analyzer.ts | 42 ++++++++++++--
//   src/index.ts       |  8 ++--
//   2 files changed, 46 insertions(+), 4 deletions(-)
function getLatestCommitStat() {
    try {
        return (0, child_process_1.execSync)("git diff-tree --no-commit-id -r --stat HEAD")
            .toString()
            .trim();
    }
    catch {
        return "File change statistics unavailable.";
    }
}
//# sourceMappingURL=getCommit.js.map