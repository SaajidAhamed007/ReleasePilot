import fs from "fs";
import {
  readCeTaskId,
  waitForAnalysis,
  getQualityGate,
  getIssues
} from "./risk/sonarClient.js";
import {
  lastCommitFiles,
  scopeToLastCommit
} from "./risk/scopeToLastCommit.js";
import { generateRiskReport } from "./risk/generateRiskReport.js";

// Latest existing release-N dir, so RISKS.md lands next to the
// changelog/release notes produced in the same run.
function currentReleaseDir(): string {
  const baseDir = "release-notes";

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const releases = fs
    .readdirSync(baseDir)
    .filter(dir => dir.startsWith("release-"))
    .map(dir => Number(dir.replace("release-", "")))
    .filter(n => !Number.isNaN(n))
    .sort((a, b) => b - a);

  const version = releases[0] ?? 1;
  const dir = `${baseDir}/release-${version}`;

  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function main() {
  const ceTaskId = readCeTaskId();
  console.log(`Waiting for SonarQube analysis ${ceTaskId}...`);
  await waitForAnalysis(ceTaskId);

  const [gate, allIssues] = await Promise.all([
    getQualityGate(),
    getIssues()
  ]);

  const changedFiles = lastCommitFiles();
  const issues = scopeToLastCommit(allIssues, changedFiles);

  const report = generateRiskReport(
    gate,
    issues,
    changedFiles
  );

  const dir = currentReleaseDir();
  fs.writeFileSync(`${dir}/RISKS.md`, report + "\n");

  console.log(report);
  console.log(`\nRisk report written to ${dir}/RISKS.md`);
}

main().catch(err => {
  console.error("Risk generation failed:", err.message);
  process.exit(1);
});
