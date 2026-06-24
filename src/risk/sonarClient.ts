import fs from "fs";

export interface SonarIssue {
  key: string;
  rule: string;
  severity: string;
  type: string;
  component: string;
  line?: number;
  message: string;
}

function getConfig() {
  const host = process.env.SONAR_HOST_URL;
  const token = process.env.SONAR_TOKEN;
  const project =
    process.env.SONAR_PROJECT_KEY || "releasepilot";

  if (!host || !token) {
    throw new Error(
      "SONAR_HOST_URL and SONAR_TOKEN must be set"
    );
  }

  return { host, token, project };
}

function authHeaders(token: string) {
  // SonarQube accepts the token as the basic-auth username
  const encoded = Buffer.from(`${token}:`).toString(
    "base64"
  );

  return { Authorization: `Basic ${encoded}` };
}

// The scanner writes the analysis (compute engine) task id here.
export function readCeTaskId(): string {
  const path = ".scannerwork/report-task.txt";

  if (!fs.existsSync(path)) {
    throw new Error(
      `Scanner report not found at ${path} — did the scan run?`
    );
  }

  const line = fs
    .readFileSync(path, "utf8")
    .split("\n")
    .find(l => l.startsWith("ceTaskId="));

  if (!line) {
    throw new Error("ceTaskId missing from report-task.txt");
  }

  return line.replace("ceTaskId=", "").trim();
}

// Analysis is async: wait until the compute engine finishes.
export async function waitForAnalysis(
  ceTaskId: string,
  attempts = 30
): Promise<void> {
  const { host, token } = getConfig();

  for (let i = 0; i < attempts; i++) {
    const res = await fetch(
      `${host}/api/ce/task?id=${ceTaskId}`,
      { headers: authHeaders(token) }
    );

    const data = await res.json();
    const status = data.task?.status;

    if (status === "SUCCESS") return;

    if (status === "FAILED" || status === "CANCELED") {
      throw new Error(`Analysis ${status}`);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  throw new Error("Timed out waiting for SonarQube analysis");
}

export async function getQualityGate(): Promise<string> {
  const { host, token, project } = getConfig();

  const res = await fetch(
    `${host}/api/qualitygates/project_status?projectKey=${project}`,
    { headers: authHeaders(token) }
  );

  const data = await res.json();
  return data.projectStatus?.status ?? "NONE";
}

export async function getIssues(): Promise<SonarIssue[]> {
  const { host, token, project } = getConfig();

  const res = await fetch(
    `${host}/api/issues/search` +
      `?componentKeys=${project}` +
      `&types=BUG,VULNERABILITY` +
      `&statuses=OPEN,CONFIRMED,REOPENED` +
      `&ps=500`,
    { headers: authHeaders(token) }
  );

  const data = await res.json();

  return (data.issues ?? []).map((i: any) => ({
    key: i.key,
    rule: i.rule,
    severity: i.severity,
    type: i.type,
    component: i.component,
    line: i.line,
    message: i.message
  }));
}
