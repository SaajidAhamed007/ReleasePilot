import { getCommits } from "./github/getCommit";
import { getGithubContext } from "./github/githubContext";

const commits = getCommits();

console.log(getGithubContext());
console.log(commits);