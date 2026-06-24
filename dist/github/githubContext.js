"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubContext = getGithubContext;
function getGithubContext() {
    return {
        repository: process.env.GITHUB_REPOSITORY,
        sha: process.env.GITHUB_SHA,
        ref: process.env.GITHUB_REF
    };
}
//# sourceMappingURL=githubContext.js.map