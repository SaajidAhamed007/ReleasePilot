import { getGithubContext } from "./github/githubContext.js";
import { getCommits } from "./github/getCommit.js";

console.log("=== GITHUB CONTEXT ===");
console.log(getGithubContext());

console.log("=== COMMITS ===");
console.log(getCommits());