import { execSync } from "child_process";

export function commitChanges() {

  execSync(
    'git config user.name "ReleasePilot Bot"'
  );

  execSync(
    'git config user.email "bot@releasepilot.ai"'
  );

  execSync("git add .");

  execSync(
    'git commit -m "docs: update changelog"'
  );

  execSync("git push");
}