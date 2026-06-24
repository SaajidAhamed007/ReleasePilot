import { commitChanges } from "./git/commitChanges.js";
import { getCommits } from "./github/getCommit.js";
import { getGithubContext } from "./github/githubContext.js";
import { generateMockFiles } from "./mock/generateMockFiles.js";

console.log(getGithubContext());
console.log(getCommits());

generateMockFiles();

commitChanges();

console.log("Mock files generated");