"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextReleaseVersion = getNextReleaseVersion;
const fs_1 = __importDefault(require("fs"));
function getNextReleaseVersion() {
    const baseDir = "release-notes";
    if (!fs_1.default.existsSync(baseDir)) {
        fs_1.default.mkdirSync(baseDir);
        return 1;
    }
    const releases = fs_1.default
        .readdirSync(baseDir)
        .filter(dir => dir.startsWith("release-"));
    return releases.length + 1;
}
//# sourceMappingURL=version.js.map