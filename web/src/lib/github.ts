import { Octokit } from "octokit";
import sodium from "libsodium-wrappers";
import {
  buildReleaseiqWorkflowYaml,
  RELEASEIQ_SECRET_NAME,
  RELEASEIQ_WORKFLOW_PATH,
  RELEASEIQ_BRANCH_PREFIX,
} from "@/lib/templates/releaseiq-workflow";

export interface AdminRepo {
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export async function listAdminRepos(accessToken: string): Promise<AdminRepo[]> {
  const octokit = new Octokit({ auth: accessToken });
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    affiliation: "owner,collaborator,organization_member",
    per_page: 100,
  });

  return repos
    .filter((repo) => repo.permissions?.admin === true)
    .map((repo) => ({
      githubRepoId: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
    }));
}

export async function verifyRepoAdmin(
  accessToken: string,
  owner: string,
  name: string
): Promise<AdminRepo | null> {
  const octokit = new Octokit({ auth: accessToken });
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo: name });
    if (!data.permissions?.admin) return null;
    return {
      githubRepoId: data.id,
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      defaultBranch: data.default_branch,
      private: data.private,
    };
  } catch {
    return null;
  }
}

async function setRepoSecret(
  octokit: Octokit,
  owner: string,
  repo: string,
  secretName: string,
  plaintextValue: string
): Promise<void> {
  const { data: publicKey } = await octokit.rest.actions.getRepoPublicKey({
    owner,
    repo,
  });

  await sodium.ready;
  const messageBytes = sodium.from_string(plaintextValue);
  const keyBytes = sodium.from_base64(publicKey.key, sodium.base64_variants.ORIGINAL);
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
  const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id,
  });
}

export interface InstallationResult {
  prUrl: string;
  branchName: string;
}

export async function createInstallationPR(
  accessToken: string,
  owner: string,
  repo: string,
  defaultBranch: string,
  ingestionToken: string
): Promise<InstallationResult> {
  const octokit = new Octokit({ auth: accessToken });

  await setRepoSecret(octokit, owner, repo, RELEASEIQ_SECRET_NAME, ingestionToken);

  const { data: baseRef } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });

  const branchName = `${RELEASEIQ_BRANCH_PREFIX}-${Date.now()}`;
  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseRef.object.sha,
  });

  const workflowYaml = buildReleaseiqWorkflowYaml(defaultBranch);
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: RELEASEIQ_WORKFLOW_PATH,
    message: "feat: install ReleaseIQ workflow",
    content: Buffer.from(workflowYaml, "utf-8").toString("base64"),
    branch: branchName,
  });

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    title: "feat: install ReleaseIQ",
    head: branchName,
    base: defaultBranch,
    body: [
      "This PR was opened automatically by [ReleaseIQ](https://release-pilot-murex.vercel.app).",
      "",
      `It adds \`${RELEASEIQ_WORKFLOW_PATH}\`, which runs on every push to \`${defaultBranch}\` and sends commit data to ReleaseIQ for AI analysis. A repository secret named \`${RELEASEIQ_SECRET_NAME}\` was also added so the workflow can authenticate.`,
      "",
      "Merge this PR to finish connecting your repository. You can disconnect at any time from the ReleaseIQ dashboard.",
    ].join("\n"),
  });

  return { prUrl: pr.html_url, branchName };
}
