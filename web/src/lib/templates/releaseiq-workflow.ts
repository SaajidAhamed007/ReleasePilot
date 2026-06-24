export function buildReleaseiqWorkflowYaml(defaultBranch: string): string {
  return `name: ReleaseIQ

on:
  push:
    branches:
      - ${defaultBranch}

jobs:
  releaseiq:
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run ReleaseIQ
        uses: SaajidAhamed007/ReleasePilot@v1
        with:
          releaseiq-token: \${{ secrets.RELEASEIQ_TOKEN }}
`;
}

export const RELEASEIQ_SECRET_NAME = "RELEASEIQ_TOKEN";
export const RELEASEIQ_WORKFLOW_PATH = ".github/workflows/releaseiq.yml";
export const RELEASEIQ_BRANCH_PREFIX = "releaseiq/install-workflow";
