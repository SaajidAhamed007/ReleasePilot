import { execSync } from "child_process";

export function commitChanges() {

  execSync(
    'git config user.name "github-actions[bot]"'
  );

  execSync(
    'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"'
  );

  execSync("git add release-notes/");

  try {
    execSync(
      'git commit -m "docs: auto generate release notes"',
      { stdio: "inherit" }
    );

    execSync("git push", {
      stdio: "inherit"
    });

  } catch {
    console.log("No changes to commit");
  }
}