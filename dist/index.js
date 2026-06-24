"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Load .env file for local development.
// In GitHub Actions, secrets are injected as real environment variables
// so dotenv is a no-op there — it never overwrites existing env vars.
require("dotenv/config");
const githubContext_js_1 = require("./github/githubContext.js");
const generateReleaseFiles_js_1 = require("./ai/generateReleaseFiles.js");
const commitChanges_js_1 = require("./git/commitChanges.js");
async function main() {
    // Log current GitHub context (repo, sha, ref)
    console.log("🚀 ReleasePilot starting...");
    console.log((0, githubContext_js_1.getGithubContext)());
    // Generate AI-powered CHANGELOG.md and RELEASE_NOTES.md
    await (0, generateReleaseFiles_js_1.generateReleaseFiles)();
    // Commit and push the generated files back to the repository
    (0, commitChanges_js_1.commitChanges)();
}
main().catch((error) => {
    console.error("❌ ReleasePilot failed:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map