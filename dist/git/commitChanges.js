"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitChanges = commitChanges;
const child_process_1 = require("child_process");
function commitChanges() {
    (0, child_process_1.execSync)('git config user.name "github-actions[bot]"');
    (0, child_process_1.execSync)('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
    (0, child_process_1.execSync)("git add release-notes/");
    try {
        (0, child_process_1.execSync)('git commit -m "docs: auto generate release notes"', { stdio: "inherit" });
        (0, child_process_1.execSync)("git push", {
            stdio: "inherit"
        });
    }
    catch {
        console.log("No changes to commit");
    }
}
//# sourceMappingURL=commitChanges.js.map