"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockFiles = generateMockFiles;
const fs_1 = __importDefault(require("fs"));
const version_js_1 = require("../utils/version.js");
function generateMockFiles() {
    const version = (0, version_js_1.getNextReleaseVersion)();
    const releaseDir = `release-notes/release-${version}`;
    fs_1.default.mkdirSync(releaseDir, {
        recursive: true
    });
    fs_1.default.writeFileSync(`${releaseDir}/CHANGELOG.md`, "# Mock Changelog");
    fs_1.default.writeFileSync(`${releaseDir}/RELEASE_NOTES.md`, "# Mock Release Notes");
}
//# sourceMappingURL=generateMockFiles.js.map