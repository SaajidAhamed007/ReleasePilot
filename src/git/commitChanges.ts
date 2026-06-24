import { execSync } from "child_process";

export function commitChanges() {

  execSync(
    'git config user.name "github-actions[bot]"'
  );

  execSync(
    'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"'
  );

  execSync("git add CHANGELOG.md RELEASE_NOTES.md");

  execSync(
    'git commit -m "docs: auto generate release notes"'
  );

  execSync("git push");
}