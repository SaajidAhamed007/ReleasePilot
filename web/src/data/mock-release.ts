export type CommitCategory = "feature" | "fix" | "refactor" | "docs";

export interface CommitEntry {
  id: string;
  hash: string;
  message: string;
  author: string;
  avatar: string;
  timestamp: string;
  category: CommitCategory;
  files: string[];
  aiExplanation: string;
}

export interface CategorySummary {
  key: CommitCategory;
  label: string;
  icon: string;
  count: number;
  color: string;
  glow: string;
  commits: CommitEntry[];
}

export interface ModuleImpact {
  name: string;
  filesChanged: number;
  riskLevel: "low" | "medium" | "high";
}

export interface AffectedModule {
  name: string;
  reasons: string[];
}

export interface QualityBreakdown {
  label: string;
  score: number;
  color: string;
}

export interface VersionDiff {
  version: string;
  fileName: string;
  oldCode: string;
  newCode: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export interface ChatExample {
  question: string;
  answer: string;
}

export const repository = {
  owner: "acme-labs",
  name: "core-platform",
  fullName: "acme-labs/core-platform",
  latestVersion: "v2.4.0",
  previousVersion: "v2.3.0",
  generatedAt: "2026-06-24T09:42:00Z",
  url: "https://github.com/acme-labs/core-platform",
};

export const releaseSummary = {
  headline: "Release Summary",
  highlights: [
    { icon: "ShieldCheck", text: "Added OAuth Authentication" },
    { icon: "Zap", text: "Improved API Performance" },
    { icon: "Bug", text: "Fixed Session Timeout" },
    { icon: "RefreshCcw", text: "Refactored User Service" },
  ],
  narrative:
    "This release ships Google OAuth login, a 38% reduction in p95 API latency, and resolves the long-standing session timeout bug reported by enterprise customers. The user service was refactored to support pluggable identity providers ahead of the upcoming SSO rollout.",
};

export const categories: CategorySummary[] = [
  {
    key: "feature",
    label: "Features",
    icon: "Rocket",
    count: 14,
    color: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/40",
    commits: [
      {
        id: "f1",
        hash: "a3f9c2e",
        message: "add Google OAuth authentication flow",
        author: "Maya Chen",
        avatar: "MC",
        timestamp: "2026-06-22T14:12:00Z",
        category: "feature",
        files: ["src/auth/oauth.ts", "src/auth/providers/google.ts", "src/routes/auth.ts"],
        aiExplanation:
          "Implemented Google OAuth Authentication with PKCE flow, token refresh handling, and secure cookie storage.",
      },
      {
        id: "f2",
        hash: "9b1d44a",
        message: "introduce pluggable identity provider interface",
        author: "Diego Ruiz",
        avatar: "DR",
        timestamp: "2026-06-21T09:03:00Z",
        category: "feature",
        files: ["src/auth/provider.interface.ts", "src/auth/registry.ts"],
        aiExplanation:
          "Adds an extensible provider interface so SAML and Okta integrations can be added without touching core auth logic.",
      },
      {
        id: "f3",
        hash: "5e7af31",
        message: "add real-time notification streaming via websockets",
        author: "Priya Nair",
        avatar: "PN",
        timestamp: "2026-06-19T17:41:00Z",
        category: "feature",
        files: ["src/notifications/socket.ts", "src/notifications/stream.ts"],
        aiExplanation:
          "Introduces a WebSocket channel for push notifications, replacing the previous 15s polling interval.",
      },
    ],
  },
  {
    key: "fix",
    label: "Fixes",
    icon: "Bug",
    count: 9,
    color: "from-rose-500 to-orange-400",
    glow: "shadow-rose-500/40",
    commits: [
      {
        id: "x1",
        hash: "c81e9f0",
        message: "fix session timeout firing during active use",
        author: "Sam Okafor",
        avatar: "SO",
        timestamp: "2026-06-22T11:05:00Z",
        category: "fix",
        files: ["src/auth/session.ts", "src/middleware/heartbeat.ts"],
        aiExplanation:
          "Session expiry timer was not resetting on background heartbeat pings, logging out active users after 20 minutes.",
      },
      {
        id: "x2",
        hash: "70bb4d8",
        message: "fix race condition in payment webhook handler",
        author: "Maya Chen",
        avatar: "MC",
        timestamp: "2026-06-20T08:27:00Z",
        category: "fix",
        files: ["src/payments/webhooks.ts"],
        aiExplanation:
          "Duplicate Stripe webhook deliveries could double-charge a subscription; added idempotency key checks.",
      },
    ],
  },
  {
    key: "refactor",
    label: "Refactors",
    icon: "RefreshCcw",
    count: 11,
    color: "from-sky-500 to-cyan-400",
    glow: "shadow-sky-500/40",
    commits: [
      {
        id: "r1",
        hash: "2dca918",
        message: "refactor user service to support multiple auth backends",
        author: "Diego Ruiz",
        avatar: "DR",
        timestamp: "2026-06-21T16:54:00Z",
        category: "refactor",
        files: ["src/users/service.ts", "src/users/repository.ts"],
        aiExplanation:
          "Decoupled UserService from a single password-based auth assumption, paving the way for OAuth and SSO providers.",
      },
      {
        id: "r2",
        hash: "8f2a103",
        message: "extract API response caching into shared middleware",
        author: "Priya Nair",
        avatar: "PN",
        timestamp: "2026-06-18T13:09:00Z",
        category: "refactor",
        files: ["src/middleware/cache.ts", "src/api/routes.ts"],
        aiExplanation:
          "Centralized response caching logic that was duplicated across 6 route handlers into one configurable middleware.",
      },
    ],
  },
  {
    key: "docs",
    label: "Documentation",
    icon: "BookOpen",
    count: 6,
    color: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/40",
    commits: [
      {
        id: "d1",
        hash: "44ac7e2",
        message: "document OAuth setup and provider configuration",
        author: "Sam Okafor",
        avatar: "SO",
        timestamp: "2026-06-22T18:30:00Z",
        category: "docs",
        files: ["docs/auth/oauth-setup.md"],
        aiExplanation:
          "Adds a step-by-step guide for configuring Google OAuth client credentials in staging and production.",
      },
      {
        id: "d2",
        hash: "0c5b291",
        message: "update API reference for notification streaming",
        author: "Priya Nair",
        avatar: "PN",
        timestamp: "2026-06-19T19:02:00Z",
        category: "docs",
        files: ["docs/api/notifications.md"],
        aiExplanation:
          "Documents the new WebSocket notification events and payload schema for integrators.",
      },
    ],
  },
];

export const timeline: CommitEntry[] = categories
  .flatMap((c) => c.commits)
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const impactModules: ModuleImpact[] = [
  { name: "Authentication", filesChanged: 18, riskLevel: "high" },
  { name: "Payments", filesChanged: 7, riskLevel: "medium" },
  { name: "Users", filesChanged: 12, riskLevel: "medium" },
  { name: "Notifications", filesChanged: 9, riskLevel: "low" },
  { name: "Analytics", filesChanged: 4, riskLevel: "low" },
  { name: "Billing", filesChanged: 3, riskLevel: "low" },
];

export const riskAnalysis = {
  level: "HIGH" as const,
  confidence: 89,
  primaryModule: "Authentication Module",
  reasons: [
    "Token validation logic modified",
    "Session handling updated",
    "New external OAuth dependency introduced",
  ],
  affectedModules: [
    { name: "Authentication", reasons: ["Token validation logic modified", "Session handling updated"] },
    { name: "Users", reasons: ["Auth backend interface changed"] },
    { name: "Payments", reasons: ["Webhook idempotency logic touched"] },
  ] as AffectedModule[],
};

export const qualityScore = {
  overall: 92,
  breakdown: [
    { label: "Documentation", score: 88, color: "#34d399" },
    { label: "Test Coverage", score: 95, color: "#38bdf8" },
    { label: "Code Quality", score: 93, color: "#a78bfa" },
    { label: "Maintainability", score: 91, color: "#fb923c" },
  ] as QualityBreakdown[],
};

export const availableVersions = ["v2.1.0", "v2.2.0", "v2.3.0", "v2.4.0"];

export const versionComparisons: Record<string, VersionDiff> = {
  "v2.3.0->v2.4.0": {
    version: "v2.3.0 → v2.4.0",
    fileName: "src/auth/session.ts",
    added: ["Google OAuth provider", "WebSocket notification stream", "Pluggable identity provider interface"],
    removed: ["Legacy polling-based notification fetcher", "Hardcoded password-only auth check"],
    modified: ["UserService auth backend resolution", "Payment webhook idempotency handling"],
    oldCode: `function validateSession(session) {
  if (!session || !session.token) {
    return false;
  }
  return session.expiresAt > Date.now();
}

function refreshOnActivity(session) {
  // no-op: heartbeat does not reset expiry
  return session;
}`,
    newCode: `function validateSession(session: Session): boolean {
  if (!session?.token) return false;
  const isExpired = session.expiresAt <= Date.now();
  return !isExpired || session.provider === "oauth";
}

function refreshOnActivity(session: Session): Session {
  return {
    ...session,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}`,
  },
  "v2.2.0->v2.3.0": {
    version: "v2.2.0 → v2.3.0",
    fileName: "src/api/cache.ts",
    added: ["Shared API response cache middleware", "Rate limit headers"],
    removed: ["Per-route caching duplication"],
    modified: ["Route handler signatures"],
    oldCode: `app.get("/users", async (req, res) => {
  const cached = memo.get("users");
  if (cached) return res.json(cached);
  const data = await db.users.findAll();
  memo.set("users", data, 60);
  res.json(data);
});`,
    newCode: `app.get("/users", withCache({ ttl: 60 }), async (req, res) => {
  const data = await db.users.findAll();
  res.json(data);
});`,
  },
};

export const shareRelease = {
  socialPost:
    "🚀 ReleaseIQ just shipped v2.4.0 for core-platform!\n\n✅ Google OAuth Authentication\n⚡ 38% faster API responses\n🐛 Session timeout bug fixed\n♻️ User service refactor for SSO-readiness\n\nFull AI-generated release notes ↓",
  markdownPreview: `# core-platform v2.4.0

## 🚀 Features
- Add Google OAuth authentication flow
- Real-time notification streaming via WebSockets

## 🐛 Fixes
- Fix session timeout firing during active use
- Fix race condition in payment webhook handler

## ♻️ Refactors
- Refactor user service to support multiple auth backends

## 📚 Documentation
- Document OAuth setup and provider configuration
`,
};

export const chatExamples: ChatExample[] = [
  {
    question: "Why is risk score high?",
    answer:
      "The risk score is 89% (HIGH) because this release modifies token validation logic and session handling in the Authentication module while introducing a new OAuth dependency — three of the most failure-sensitive code paths in the system.",
  },
  {
    question: "What changed in authentication?",
    answer:
      "Authentication gained Google OAuth login with PKCE, a pluggable identity provider interface for future SSO support, and a session refresh fix so active users no longer get logged out after 20 minutes.",
  },
  {
    question: "Summarize release in 20 words.",
    answer:
      "v2.4.0 adds Google OAuth and real-time notifications, fixes session timeout and payment race conditions, and refactors auth for SSO readiness.",
  },
];

export const defaultChatAnswer =
  "I can help with questions about this release — try asking about risk, specific modules, or a quick summary.";
