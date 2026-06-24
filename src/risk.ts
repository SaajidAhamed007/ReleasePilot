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

  // Embed the risk section into the latest-commit document so the
  // findings show up in the main per-release markdown. Demote the H1
  // to H2 so it nests under the existing document headings.
  const latestCommitPath = `${dir}/LATEST_COMMIT.md`;
  const embedded =
    "\n\n---\n\n" + report.replace(/^# /, "## ") + "\n";

  if (fs.existsSync(latestCommitPath)) {
    fs.appendFileSync(latestCommitPath, embedded);
  } else {
    fs.writeFileSync(latestCommitPath, report + "\n");
  }

  console.log(report);
  console.log(
    `\nRisk report written to ${dir}/RISKS.md and embedded into ${latestCommitPath}`
  );

  // Concise one-line summary for the workflow log.
  if (issues.length === 0) {
    console.log("\nPossible risks are: none detected ✅");
  } else {
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
  console.log(
    "Possible risks are: could not be determined " +
      `(risk analysis unavailable: ${err.message})`
  );
  process.exit(0);
});
