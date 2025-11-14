Purpose: rules, guardrails and best-practice guidance for any automated agent (Cursor / agentic mode) or developer working on the Next Subscription codebase. The agent must read and obey these rules before executing any change. This file focuses on frontend + backend conventions, theme usage, safety, commit discipline, and non-breaking refactors.
1 — Read First, Act Second
Always scan the entire target folder(s) mentioned in the prompt before making any edits.
Produce a short plan of changes and a To-Do checklist, then execute step-by-step.
If any requested change looks ambiguous or risky, prefer to create a clear TODO and request human confirmation — but do not stop the operation entirely if the user explicitly said "just do it". In that case, make the smallest safe change possible and document it.
2 — High-level rules (global)
Never change business logic. Refactors and cleanups must preserve runtime behavior and API contracts. If a change could alter behavior, create a non-destructive fallback and document it.
Do not modify the frontend from backend tasks; do not modify the backend from frontend tasks — unless the prompt explicitly asks cross-stack changes. Always confirm scope.
Always run static checks (lint/typecheck) and attempt a build locally (or execute equivalent checks) before finalizing. If checks fail, revert changes or create clear remediation steps.
Safety first: any destructive command (delete DB rows, drop collections, restart servers) must be gated by explicit admin confirmation and require a safety modal or a signed command.
3 — File & folder structure rules (recommended conventions)
The agent should prefer this structure and, when asked to reorganize, move files into this layout:
/backend
  /src
    /config           # env, constants, connection helpers
    /controllers      # request handlers
    /services         # business logic (DB, external APIs)
    /routes           # express/fastify route files (delegates to controllers)
    /models           # mongoose/sequelize models
    /middleware       # auth, error, rate-limit, etc
    /utils            # small helpers
    /jobs             # background workers / cron
    /logs             # rotated logs (not repo committed)
    app.js
  server.js

/frontend (or /src for mono-repo)
  /src
    /components
    /pages /routes
    /hooks
    /styles
    /lib
    /constants        # themeTokens.ts, ui.ts, route constants
    /utils
    /assets
    /tests
When reorganizing:
Update all imports/exports to correct paths (prefer absolute imports where configured).
Leave compatibility re-exports for a transition period: create src/legacy-exports.js mapping old paths to new ones. Mark deprecated exports with a comment.
4 — Naming conventions & patterns
Files: kebab-case for filenames, PascalCase for React components and classes.
Folders: kebab-case.
Exports: prefer named exports; default-only for React components is acceptable.
Constants file names: themeTokens.ts, uiConstants.ts, apiPaths.ts in /src/constants.
Services: <thing>Service.js e.g. authService.js.
Controllers: <thing>Controller.js.
5 — Theme tokens (MANDATORY)
All colors, spacing tokens, font sizes and semantic color roles MUST come from /src/constants/themeTokens (frontend) or /src/config/themeTokens (backend usage e.g., email templates).
No hardcoded hex/rgb values in components. The agent must replace hardcoded colors with tokens during refactors.
Provide light & dark tokens:
primary, primary-contrast, background, surface, text, muted, accent, danger, success, etc.
All color usages must be contrast-checked for accessibility. If any color combination is under WCAG AA, return it for manual review.
6 — Dark / Light theme rules
ThemeProvider must expose both token sets and CSS variables. Components must pull colors via tokens or CSS variables — not by logic calculating colors inline.
Text color must always contrast with the background for readable UI:
Light mode: text on background or surface should be at least WCAG AA.
Dark mode: text should be a light token and surface must be darker.
Logos or third-party black assets: prefer white/inverted variants in dark mode. If not available, render them within a contrast-safe pill (small surface with adequate contrast).
7 — Commenting policy (MANDATORY)
Each file must start with a header comment block:
/**
 * FILE: <path>
 * PURPOSE: <one-line summary>
 * AUTHOR: Next Subscription Agent / Developer
 * LAST_UPDATED: YYYY-MM-DD
 */
Each exported function must have a short JSDoc comment with usage, params, and return description.
For any refactor that removes or renames code, add an explanatory comment and add an entry in CHANGELOG.md under a "Refactor" heading.
Use inline // FIX: comments for critical bug fixes and // TODO: with ticket references for deferred work.
8 — Code quality & safety checks
Always run ESLint and TypeScript checks (if present). If not, run a quick static analysis for unused imports.
Add tests for critical refactors (unit for extracted logic, integration where possible).
Add // TEST: comments where a test is required if not implemented.
Use lean() for read-only mongoose queries, add indexes for heavy queries, and avoid populate() in loops.
9 — API & backend best practices
API routes must be idempotent where appropriate (GET safe; POST for mutations).
Validate request payloads at controller boundary (use Joi/zod/express-validator).
Use centralized error middleware; never send stack traces to client.
Add request-level logging for tracing (correlation id).
Health endpoint /api/health must be read-only and non-destructive.
Maintenance endpoints must require admin role and explicit confirmation. They must log the user and timestamp of every action.
10 — DB & collection rules
Prefer fewer, normalized collections with discriminators over many near-duplicate collections.
Use an audit_logs / system_logs collection for all logs and include type field (ERROR|INFO|MAINTENANCE).
Do not drop collections in-place; always implement migration scripts and backups.
When asked to "reduce collections", propose a migration plan: merge schema, create migration script, test on staging, then run in production with backups.
11 — Logging & system logs policy
Use structured JSON logs (timestamp, level, service, message, meta).
Save logs to persistent store and rotate daily under /logs/archives/YYYY-MM-DD.json and also store in DB system_logs for queries.
Clear logs via frontend should archive the current buffer to backend storage, not permanently destroy logs. Deleting logs must require an additional admin confirmation and be recorded in audit logs.
12 — Maintenance controls (rules of engagement)
Maintenance endpoints must be safeguarded:
Two-step confirmation in UI (dialog + typed "CONFIRM").
Rate-limit and require admin role.
Always log action and result.
Example operations allowed: cache clear, purge expired sessions, reindex collections, rotate logs, backup DB snapshot via configured backup script.
Disallowed in routine UI: database DROPs, mass irreversible deletions without backup.
13 — Performance & dependencies
Prefer modern stable libraries; avoid experimental packages for critical flows. If adding new deps, ensure a short security review (check weekly downloads, open issues).
Add npm audit step in CI for dependency security.
Use server-side caching (Redis) for hot endpoints and LRU for in-memory. Cache invalidation must be explicit.
14 — Commit & PR discipline (MANDATORY)
Every agent action that changes code must produce a short, structured commit summary and a short commit message. Use this pattern:
Branch name: agent/<scope>/<short-desc> e.g. agent/backend/health-improvements
Commit message (single line): <area>: <short action> — <ticket or note>
Example: backend(health): add db-latency check — safe non-breaking
Body (3 lines max) for commit:
One-sentence description of what changed.
One-line test performed.
BREAKING: <yes|no> (explicitly state no for non-breaking changes).
The agent must group related changes into atomic commits (one responsibility per commit).
After change, output a 1-line "push-ready" message for the developer: e.g. COMMIT READY: backend(health): add db-latency check.
15 — Pull request & rollout
PR title: <area>: <summary> — agent changes
PR description must include:
What was changed
Why
Tests run
Rollback steps
For anything touching DB schemas, include a migration script and clear staging instructions.
16 — Testing & rollout verification
Agent must run or request a smoke test script: basic flows (auth, health, main pages).
If build or tests fail, agent must revert or create a detailed remediation plan; do not push failing changes to main.
17 — When to ask human approval
If change is destructive (data removal, collection merge, server restarts).
If schema migrations are non-trivial.
If code touches more than 3 modules/components in different layers simultaneously.
If any token/key/secret rotation is required.
18 — Additional project-specific rules for Next Subscription
Theme tokens must be the single source of truth for color and text styles. Any exceptions must be justified and temporary.
All email templates must use tokens for colors.
Vendor credentials and sensitive material must remain stored encrypted (backend rule). The agent must not store plaintext credentials anywhere in repo comments or logs.
System monitoring and maintenance UI is admin-only; agent must verify role gating before exposing endpoints.
19 — Short audit output format (what agent returns after each run)
After each execution, return a short structured summary (exact format):
SUMMARY:
- CHANGES: <n> files changed, <m> commits
- COMMITS:
  - <commit-hash> | <commit-message>
- TESTS RUN: <yes/no>; if yes list basic steps passed
- BREAKING: <yes/no>
- PUSH READY: <yes/no>
Also produce one-liner COMMIT READY lines for each commit as earlier.
20 — Enforcement & evolution
Keep this file under version control and update it when processes mature.
Agents must log whenever they deviate from these rules and produce a justification in the PR.