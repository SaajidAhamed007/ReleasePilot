"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sonarClient_js_1 = require("./risk/sonarClient.js");
const scopeToLastCommit_js_1 = require("./risk/scopeToLastCommit.js");
const generateRiskReport_js_1 = require("./risk/generateRiskReport.js");
// Latest existing release-N dir, so RISKS.md lands next to the
// changelog/release notes produced in the same run.
function currentReleaseDir() {
    const baseDir = "release-notes";
    if (!fs_1.default.existsSync(baseDir)) {
        fs_1.default.mkdirSync(baseDir, { recursive: true });
    }
    const releases = fs_1.default
        .readdirSync(baseDir)
        .filter(dir => dir.startsWith("release-"))
        .map(dir => Number(dir.replace("release-", "")))
        .filter(n => !Number.isNaN(n))
        .sort((a, b) => b - a);
    const version = releases[0] ?? 1;
    const dir = `${baseDir}/release-${version}`;
    fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
async function main() {
    const ceTaskId = (0, sonarClient_js_1.readCeTaskId)();
    console.log(`Waiting for SonarQube analysis ${ceTaskId}...`);
    await (0, sonarClient_js_1.waitForAnalysis)(ceTaskId);
    const [gate, allIssues] = await Promise.all([
        (0, sonarClient_js_1.getQualityGate)(),
        (0, sonarClient_js_1.getIssues)()
    ]);
    const changedFiles = (0, scopeToLastCommit_js_1.lastCommitFiles)();
    const issues = (0, scopeToLastCommit_js_1.scopeToLastCommit)(allIssues, changedFiles);
    const report = (0, generateRiskReport_js_1.generateRiskReport)(gate, issues, changedFiles);
    const dir = currentReleaseDir();
    fs_1.default.writeFileSync(`${dir}/RISKS.md`, report + "\n");
    // Embed the risk section into the latest-commit document so the
    // findings show up in the main per-release markdown. Demote the H1
    // to H2 so it nests under the existing document headings.
    const latestCommitPath = `${dir}/LATEST_COMMIT.md`;
    const embedded = "\n\n---\n\n" + report.replace(/^# /, "## ") + "\n";
    if (fs_1.default.existsSync(latestCommitPath)) {
        fs_1.default.appendFileSync(latestCommitPath, embedded);
    }
    else {
        fs_1.default.writeFileSync(latestCommitPath, report + "\n");
    }
    console.log(report);
    console.log(`\nRisk report written to ${dir}/RISKS.md and embedded into ${latestCommitPath}`);
    // Concise one-line summary for the workflow log.
    if (issues.length === 0) {
        console.log("\nPossible risks are: none detected ✅");
    }
    else {
        const summary = issues
            .map(i => {
            const file = i.component.split(":").pop() ?? "";
            const where = i.line ? `${file}:${i.line}` : file;
            return `${i.message} (${where})`;
        })
            .join("; ");
        console.log(`\nPossible risks are: ${summary}`);
    }
}
// Risk analysis is advisory: never fail the workflow over it.
main().catch(err => {
    console.log("Possible risks are: could not be determined " +
        `(risk analysis unavailable: ${err.message})`);
    process.exit(0);
});
//# sourceMappingURL=risk.js.map