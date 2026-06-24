import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  primaryKey,
  jsonb,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---- Auth.js-required tables (shape mirrors @auth/drizzle-adapter's defineTables) ----

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ---- Domain tables ----

export const repoStatusEnum = pgEnum("repo_status", [
  "pending_pr",
  "active",
  "revoked",
]);

export const connectedRepos = pgTable(
  "connected_repos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    githubRepoId: bigint("github_repo_id", { mode: "number" }).notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    defaultBranch: text("default_branch").notNull(),
    ingestionTokenHash: text("ingestion_token_hash").notNull(),
    installationPrUrl: text("installation_pr_url"),
    status: repoStatusEnum("status").notNull().default("pending_pr"),
    lastAnalyzedAt: timestamp("last_analyzed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("connected_repos_github_repo_id_idx").on(table.githubRepoId),
    uniqueIndex("connected_repos_ingestion_token_hash_idx").on(
      table.ingestionTokenHash
    ),
    index("connected_repos_user_id_idx").on(table.userId),
  ]
);

export const releaseStatusEnum = pgEnum("release_status", [
  "processing",
  "completed",
  "failed",
]);

export const releases = pgTable(
  "releases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    repoId: text("repo_id")
      .notNull()
      .references(() => connectedRepos.id, { onDelete: "cascade" }),
    commitSha: text("commit_sha").notNull(),
    ref: text("ref").notNull(),
    structuredData: jsonb("structured_data"),
    rawCommitCount: integer("raw_commit_count").notNull().default(0),
    status: releaseStatusEnum("status").notNull().default("processing"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("releases_repo_id_created_at_idx").on(table.repoId, table.createdAt),
  ]
);
