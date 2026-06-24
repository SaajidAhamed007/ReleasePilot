import fs from "fs";
import { getNextReleaseVersion } from "../utils/version.js";

export function generateMockFiles() {

  const version = getNextReleaseVersion();

  const releaseDir =
    `release-notes/release-${version}`;

  fs.mkdirSync(releaseDir, {
    recursive: true
  });

  fs.writeFileSync(
    `${releaseDir}/CHANGELOG.md`,
    "# Mock Changelog"
  );

  fs.writeFileSync(
    `${releaseDir}/RELEASE_NOTES.md`,
    "# Mock Release Notes"
  );
}