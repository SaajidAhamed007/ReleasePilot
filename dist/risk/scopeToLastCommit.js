"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastCommitFiles = lastCommitFiles;
exports.scopeToLastCommit = scopeToLastCommit;
const child_process_1 = require("child_process");
// Files touched by the most recent commit.
function lastCommitFiles() {
    const output = (0, child_process_1.execSync)('git show --numstat --format="" HEAD').toString();
    return output
        .split("\n")
        .filter(Boolean)
        .map(line => line.split("\t")[2])
        .filter(Boolean);
}
// SonarQube reports components as "projectKey:path/to/file".
// Keep only issues whose file changed in the last commit.
function scopeToLastCommit(issues, changedFiles) {
    return issues.filter(issue => changedFiles.some(file => issue.component.endsWith(`:${file}`) ||
        issue.component.endsWith(file)));
}
//# sourceMappingURL=scopeToLastCommit.js.map