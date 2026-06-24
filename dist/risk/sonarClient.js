"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCeTaskId = readCeTaskId;
exports.waitForAnalysis = waitForAnalysis;
exports.getQualityGate = getQualityGate;
exports.getIssues = getIssues;
const fs_1 = __importDefault(require("fs"));
function getConfig() {
    const host = process.env.SONAR_HOST_URL;
    const token = process.env.SONAR_TOKEN;
    const project = process.env.SONAR_PROJECT_KEY || "releasepilot";
    if (!host || !token) {
        throw new Error("SONAR_HOST_URL and SONAR_TOKEN must be set");
    }
    return { host, token, project };
}
function authHeaders(token) {
    // SonarQube accepts the token as the basic-auth username
    const encoded = Buffer.from(`${token}:`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
}
// The scanner writes the analysis (compute engine) task id here.
function readCeTaskId() {
    const path = ".scannerwork/report-task.txt";
    if (!fs_1.default.existsSync(path)) {
        throw new Error(`Scanner report not found at ${path} — did the scan run?`);
    }
    const line = fs_1.default
        .readFileSync(path, "utf8")
        .split("\n")
        .find(l => l.startsWith("ceTaskId="));
    if (!line) {
        throw new Error("ceTaskId missing from report-task.txt");
    }
    return line.replace("ceTaskId=", "").trim();
}
// Analysis is async: wait until the compute engine finishes.
async function waitForAnalysis(ceTaskId, attempts = 30) {
    const { host, token } = getConfig();
    for (let i = 0; i < attempts; i++) {
        const res = await fetch(`${host}/api/ce/task?id=${ceTaskId}`, { headers: authHeaders(token) });
        const data = await res.json();
        const status = data.task?.status;
        if (status === "SUCCESS")
            return;
        if (status === "FAILED" || status === "CANCELED") {
            throw new Error(`Analysis ${status}`);
        }
        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error("Timed out waiting for SonarQube analysis");
}
async function getQualityGate() {
    const { host, token, project } = getConfig();
    const res = await fetch(`${host}/api/qualitygates/project_status?projectKey=${project}`, { headers: authHeaders(token) });
    const data = await res.json();
    return data.projectStatus?.status ?? "NONE";
}
async function getIssues() {
    const { host, token, project } = getConfig();
    const res = await fetch(`${host}/api/issues/search` +
        `?componentKeys=${project}` +
        `&types=BUG,VULNERABILITY` +
        `&statuses=OPEN,CONFIRMED,REOPENED` +
        `&ps=500`, { headers: authHeaders(token) });
    const data = await res.json();
    return (data.issues ?? []).map((i) => ({
        key: i.key,
        rule: i.rule,
        severity: i.severity,
        type: i.type,
        component: i.component,
        line: i.line,
        message: i.message
    }));
}
//# sourceMappingURL=sonarClient.js.map