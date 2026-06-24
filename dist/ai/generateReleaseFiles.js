"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReleaseFiles = generateReleaseFiles;
const fs_1 = __importDefault(require("fs"));
const getCommit_js_1 = require("../github/getCommit.js");
const analyzer_js_1 = require("./analyzer.js");
const RELEASE_DIR = "release-notes";
const EVOLUTION_FILE = `${RELEASE_DIR}/PROJECT_EVOLUTION.md`;
const LATEST_FILE = `${RELEASE_DIR}/LATEST_COMMIT.md`;
/**
 * Overwrites two fixed Markdown files on every commit — no versioned folders.
 *
 *   release-notes/PROJECT_EVOLUTION.md  — full project history narrative
 *   release-notes/LATEST_COMMIT.md      — breakdown of the latest commit
 *
 * Both files are always up-to-date with the current state of the repo.
 */
async function generateReleaseFiles() {
    // Step 1: Fetch full commit history for the evolution document
    const allCommits = (0, getCommit_js_1.getAllCommits)();
    console.log(`📋 Fetched ${allCommits.length} total commit(s) for analysis.`);
    // Step 2: Fetch file-change stats for the latest commit
    const latestFileStat = (0, getCommit_js_1.getLatestCommitStat)();
    console.log("📊 Latest commit file stats retrieved.");
    // Step 3: Send to Gemini (or use fallback if API is unavailable)
    const { evolution, latestCommit } = await (0, analyzer_js_1.analyzeCommits)(allCommits, latestFileStat);
    // Step 4: Ensure the release-notes directory exists
    fs_1.default.mkdirSync(RELEASE_DIR, { recursive: true });
    // Step 5: Overwrite the same two files every time
    fs_1.default.writeFileSync(EVOLUTION_FILE, evolution, "utf-8");
    fs_1.default.writeFileSync(LATEST_FILE, latestCommit, "utf-8");
    console.log(`📄 PROJECT_EVOLUTION.md → ${EVOLUTION_FILE}`);
    console.log(`📄 LATEST_COMMIT.md     → ${LATEST_FILE}`);
    console.log(`✅ Release files updated successfully.`);
}
//# sourceMappingURL=generateReleaseFiles.js.map