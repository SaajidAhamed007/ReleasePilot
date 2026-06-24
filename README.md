# ReleasePilot

**AI-powered release notes generator for any GitHub repository.**

ReleasePilot is a GitHub Action that reads your commit history, sends it to the ReleaseIQ AI backend, and automatically writes two Markdown documents to your repository — a full project evolution summary and a detailed breakdown of the latest commit. Works with any tech stack: Node.js, Python, Java, Go, Rust, PHP, and more.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Your Repository                              │
│                      (any tech stack)                               │
│                                                                     │
│   push to main                                                      │
│        │                                                            │
│        ▼                                                            │
│   GitHub Actions Workflow                                           │
│        │                                                            │
│        │  uses: SaajidAhamed007/ReleasePilot@v1                    │
│        ▼                                                            │
└────────┬────────────────────────────────────────────────────────────┘
         │
         │  Step 1 — Read Git history (runs inside your repo checkout)
         │  git log          →  Commit[]   (sha, message, author, date)
         │  git diff-tree    →  FileDiff[] (file, status, patch, +/-)
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ReleasePilot Action                               │
│             (SaajidAhamed007/ReleasePilot)                         │
│                                                                     │
│   index.ts                 reads inputs via @actions/core          │
│   github/getCommit.ts      git log + git diff-tree                 │
│   ai/analyzer.ts           POST /api/analyze to ReleaseIQ          │
│   ai/generateReleaseFiles  writes the two Markdown files           │
│   git/commitChanges.ts     git commit + push                       │
└────────┬────────────────────────────────────────────────────────────┘
         │
         │  Step 2 — POST /api/analyze
         │  {
         │    repoFullName,  commitSha,  ref,
         │    commits[],     diffs[]
         │  }
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               ReleaseIQ Backend                                     │
│         (release-pilot-murex.vercel.app)                           │
│                                                                     │
│   Auth: Bearer <RELEASEIQ_TOKEN>                                   │
│        │                                                            │
│        ▼                                                            │
│   Gemini AI  (gemini-2.5-flash)                                    │
│        │                                                            │
│        ▼                                                            │
│   { releaseId, markdownSummary }                                   │
└────────┬────────────────────────────────────────────────────────────┘
         │
         │  Step 3 — Write to your repository
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Your Repository                              │
│                                                                     │
│   release-notes/                                                    │
│   ├── PROJECT_EVOLUTION.md   ← full history narrative              │
│   └── LATEST_COMMIT.md       ← latest commit deep dive            │
│                                                                     │
│   committed and pushed automatically on every run                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Output Files

Both files live at the same paths on every commit — they are overwritten, never versioned into numbered folders.

### `release-notes/PROJECT_EVOLUTION.md`

A narrative of how your project has grown across its entire commit history.

```markdown
# Project Evolution

## Project Overview
ReleasePilot is a GitHub Action that auto-generates AI-powered release
notes from commit history using the ReleaseIQ backend.

## How the Project Evolved

### Phase 1 — Initial Setup
- Created the project with basic GitHub Actions scaffolding.
- Added commit fetching via git log.

### Phase 2 — AI Integration
- Replaced placeholder content with Gemini AI-powered analysis.
- Introduced the ReleaseIQ backend as the AI layer.

## Feature Changes Over Time
✦ Commit Fetching    — reads real git history instead of mock data
✦ AI Analysis        — Gemini analyzes commits via ReleaseIQ backend
✦ GitHub Action      — packaged as a reusable action for any repo
✦ File Diffs         — per-file patches sent to AI for deeper analysis

## Workflow Changes
Initially the pipeline wrote "# Mock Changelog" as a placeholder.
Now it sends commits and diffs to the ReleaseIQ backend and writes
two AI-generated Markdown documents on every push.

## Current State
Production-ready GitHub Action. Works with any tech stack.
Requires only a RELEASEIQ_TOKEN to operate.
```

### `release-notes/LATEST_COMMIT.md`

A detailed technical breakdown of the single most recent commit.

```markdown
# Latest Commit Analysis

## Commit Summary
**Commit:** `5847083`
**Author:** Saajid Ahamed
**Date:** Tue Jun 24 2026
**Type:** Feature

Replaced direct Gemini calls with a request to the ReleaseIQ backend,
centralising AI logic and enabling token-based access control.

## Files Changed
- `src/ai/analyzer.ts` — Now sends a POST request to /api/analyze
  with commits and diffs instead of calling Gemini directly.
- `src/index.ts` — Reads releaseiq-token and releaseiq-api-url inputs.
- `action.yml` — Replaced gemini-api-key input with releaseiq-token.

## How the Workflow Changes
### Before This Commit
The action called the Gemini API directly using GEMINI_API_KEY.

### After This Commit
The action calls the ReleaseIQ backend which handles Gemini internally.
Users only need a RELEASEIQ_TOKEN — no direct Gemini access required.

## Impact Assessment
- **Risk Level:** Low — external endpoint change, same output format
- **Affects:** AI analysis layer, action inputs
- **Breaking Change:** Yes — gemini-api-key replaced by releaseiq-token

## What Developers Should Know
- Replace GEMINI_API_KEY secret with RELEASEIQ_TOKEN in all repos.
- Update workflow files to pass releaseiq-token instead of gemini-api-key.
```

---

## Quick Start

### 1. Get your ReleaseIQ token

Connect your repository at **[release-pilot-murex.vercel.app](https://release-pilot-murex.vercel.app)** to receive your token.

### 2. Add the secret to your repository

**Settings → Secrets and variables → Actions → New repository secret**

```
Name:  RELEASEIQ_TOKEN
Value: (your token from the ReleaseIQ dashboard)
```

### 3. Add the workflow file

Create `.github/workflows/release-notes.yml` in your repository:

```yaml
name: Generate Release Notes

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  release-notes:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # required — ReleasePilot needs full history

      - uses: SaajidAhamed007/ReleasePilot@v1
        with:
          releaseiq-token: ${{ secrets.RELEASEIQ_TOKEN }}
```

Push any commit to `main`. The action runs, calls the ReleaseIQ backend, and writes both files back to your repo automatically.

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `releaseiq-token` | **Yes** | — | ReleaseIQ ingestion token. Store as a repository secret. |
| `releaseiq-api-url` | No | `https://release-pilot-murex.vercel.app` | Backend URL. Override only for local development. |
| `github-token` | No | `github.token` | Token for committing files. The built-in token works for most cases. |
| `commit-notes` | No | `true` | Set to `false` to write files without committing them. |
| `commit-message` | No | `docs: update AI-generated release notes [skip ci]` | Commit message for the auto-commit. |
| `evolution-file` | No | `release-notes/PROJECT_EVOLUTION.md` | Output path for the project evolution document. |
| `latest-commit-file` | No | `release-notes/LATEST_COMMIT.md` | Output path for the latest commit analysis. |
| `max-commits` | No | `100` | Number of recent commits to include in the evolution analysis. |

## Outputs

| Output | Description |
|--------|-------------|
| `evolution-file` | Path to the written project evolution document. |
| `latest-commit-file` | Path to the written latest commit analysis. |

---

## Advanced Usage

### Custom output paths

```yaml
- uses: SaajidAhamed007/ReleasePilot@v1
  with:
    releaseiq-token: ${{ secrets.RELEASEIQ_TOKEN }}
    evolution-file: docs/HISTORY.md
    latest-commit-file: docs/LATEST.md
```

### Generate files without committing, then open a pull request

```yaml
- uses: SaajidAhamed007/ReleasePilot@v1
  id: rp
  with:
    releaseiq-token: ${{ secrets.RELEASEIQ_TOKEN }}
    commit-notes: 'false'

- uses: peter-evans/create-pull-request@v6
  with:
    title: "docs: AI-generated release notes"
    branch: release-notes-update
    commit-message: "docs: update release notes"
```

### Use output paths in a later step

```yaml
- uses: SaajidAhamed007/ReleasePilot@v1
  id: rp
  with:
    releaseiq-token: ${{ secrets.RELEASEIQ_TOKEN }}

- uses: actions/upload-artifact@v4
  with:
    name: release-notes
    path: |
      ${{ steps.rp.outputs.evolution-file }}
      ${{ steps.rp.outputs.latest-commit-file }}
```

### Analyze more commits for larger projects

```yaml
- uses: SaajidAhamed007/ReleasePilot@v1
  with:
    releaseiq-token: ${{ secrets.RELEASEIQ_TOKEN }}
    max-commits: '250'
```

---

## Repository Structure

```
ReleasePilot/
│
├── action.yml                          ← Action definition (inputs, outputs, entry point)
│
├── src/
│   ├── index.ts                        ← Entry point; reads inputs via @actions/core
│   │
│   ├── github/
│   │   ├── getCommit.ts                ← git log → Commit[]; git diff-tree → FileDiff[]
│   │   └── githubContext.ts            ← reads GITHUB_REPOSITORY / SHA / REF env vars
│   │
│   ├── git/
│   │   └── commitChanges.ts            ← git commit + push with token-injected remote URL
│   │
│   └── ai/
│       ├── prompt.ts                   ← Gemini prompt builder (used by the backend)
│       ├── analyzer.ts                 ← POST /api/analyze → AnalysisResult
│       └── generateReleaseFiles.ts     ← orchestrates: fetch → analyze → write files
│
├── dist/
│   └── index.js                        ← Bundled action (ncc); committed to this repo
│
├── examples/
│   └── releasepilot-usage.yml          ← Copy-paste workflow for users
│
└── .github/workflows/
    ├── test.yml                        ← CI: typecheck → bundle → commit dist/
    └── release.yml                     ← CD: tag → bundle → GitHub Release → update v1 tag
```

---

## Important: `fetch-depth: 0`

ReleasePilot reads your **full** commit history to build the project evolution document. Without `fetch-depth: 0`, GitHub Actions only fetches the last commit and the AI has nothing meaningful to analyze.

```yaml
# ✅ Correct
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

# ❌ Wrong — AI only sees 1 commit
- uses: actions/checkout@v4
```

---

## Fallback Behavior

ReleasePilot never fails your CI pipeline. If the backend is unreachable:

| Scenario | Result |
|----------|--------|
| `RELEASEIQ_TOKEN` not set | Logs warning, writes raw commit list |
| Backend unreachable | Logs error, writes raw commit list |
| Backend returns error status | Logs error, writes raw commit list |
| Zero commits in repository | Writes placeholder, no API call made |
| Files unchanged since last run | Skips commit silently |

---

## Permissions Required

The workflow that calls ReleasePilot needs `contents: write` so the action can commit the generated files back to your repository.

```yaml
jobs:
  release-notes:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # ← required
```

---

## Building Locally

ReleasePilot uses [`@vercel/ncc`](https://github.com/vercel/ncc) to bundle the entire TypeScript source and all dependencies into a single `dist/index.js`. This file is committed to the repo so GitHub Actions can run it without installing packages.

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build and bundle → dist/index.js
npm run build

# Run locally (for development)
npm run dev
```

The CI workflow (`test.yml`) builds and commits `dist/` automatically on every push to `main`. The release workflow (`release.yml`) bundles, creates a GitHub Release, and moves the floating `v1` tag whenever you push a version tag like `v1.0.1`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes in `src/`
4. Run `npm run typecheck` to catch type errors
5. Run `npm run build` to update `dist/index.js`
6. Commit both `src/` changes and `dist/index.js`
7. Open a pull request

---

## License

ISC © Saajid Ahamed
