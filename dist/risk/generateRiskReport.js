"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRiskReport = generateRiskReport;
const SEVERITY_ORDER = {
    BLOCKER: 0,
    CRITICAL: 1,
    MAJOR: 2,
    MINOR: 3,
    INFO: 4
};
function riskLevel(gate, issues) {
    const hasBlocker = issues.some(i => ["BLOCKER", "CRITICAL"].includes(i.severity));
    if (gate === "ERROR" || hasBlocker)
        return "🔴 High";
    if (issues.length > 0)
        return "🟡 Medium";
    return "🟢 Low";
}
function generateRiskReport(gate, issues, changedFiles) {
    const level = riskLevel(gate, issues);
    const sorted = [...issues].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) -
        (SEVERITY_ORDER[b.severity] ?? 9));
    const lines = [];
    lines.push("# ⚠️ Risk Assessment");
    lines.push("");
    lines.push(`**Overall risk:** ${level}`);
    lines.push(`**Quality Gate:** ${gate}`);
    lines.push(`**Files changed in last commit:** ${changedFiles.length}`);
    lines.push(`**Risks introduced by last commit:** ${issues.length}`);
    lines.push("");
    if (sorted.length === 0) {
        lines.push("No new bugs or vulnerabilities detected in the changed files. ✅");
        return lines.join("\n");
    }
    lines.push("## Findings");
    lines.push("");
    lines.push("| Severity | Type | Location | Issue |");
    lines.push("| --- | --- | --- | --- |");
    for (const issue of sorted) {
        const file = issue.component.split(":").pop() ?? "";
        const location = issue.line
            ? `${file}:${issue.line}`
            : file;
        lines.push(`| ${issue.severity} | ${issue.type} | \`${location}\` | ${issue.message} |`);
    }
    return lines.join("\n");
}
//# sourceMappingURL=generateRiskReport.js.map