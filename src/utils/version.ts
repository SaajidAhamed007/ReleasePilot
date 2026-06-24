import fs from "fs";

export function getNextReleaseVersion() {
  const baseDir = "release-notes";

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
    return 1;
  }

  const releases = fs
    .readdirSync(baseDir)
    .filter(dir => dir.startsWith("release-"));

  return releases.length + 1;
}