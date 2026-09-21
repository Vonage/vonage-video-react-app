---
name: session-migration-archiving-backend
description: Implement, from scratch, the backend support for Vonage Video API session migration (server rotation) as it relates to ARCHIVING. Use this when a user asks to add, rebuild, or reason about automatic archive recovery after a server rotation, the /hooks/session and /hooks/archive webhooks, session storage for archiveIds/serverRotationPending, or the stopArchive archiveId fallback. Scope is archiving only. Applies to the backend app and the libs/api handlers only (no frontend work).
---

# Session Migration (Archiving) — Backend

**Scope:** this skill covers ARCHIVING recovery only. Only the backend + `libs/api` pieces are in
scope; do not touch the frontend.

## What "session migration" means here

Vonage rotates the media server that hosts a session roughly every 8 hours (or on
infrastructure events). This is called a **server rotation**. When it happens:

1. Vonage emits a `sessionDestroyed` session webhook with `reason: 'serverRotation'`.
2. Vonage stops any in-progress archives itself, emitting an archive `stopped` webhook.
3. Clients transparently reconnect to the new server (frontend uses `sessionMigration: true`).

The archive does **not** resume on its own. The backend's job is to detect a server rotation
and **restart archiving once per session** so recording continues seamlessly. Restarting from
the backend (not the client) guarantees a single restart regardless of participant count.

## Key design decisions (respect these)

- **Backend owns the restart**, not the client. One restart per session, no races.
- **The `serverRotation` flag is the bridge between two webhooks.** The `/hooks/session`
  `sessionDestroyed` event carries `reason: 'serverRotation'`; the later `/hooks/archive`
  `stopped` event does **not** carry a usable reason. So `/hooks/session` must persist a
  `serverRotationPending` flag that the archive `stopped` handler reads.
- **On server rotation, do NOT stop archives** in the session handler — Vonage already stops
  them and we want them to restart. For every other `sessionDestroyed` reason, stop all archives
  and clear state.
- **Webhooks are async, retried, and can arrive out of order.** Handle idempotently. Use
  IDs as source of truth. De-duplicate archive IDs with a `Set`.
- **Never let a webhook handler reject asynchronously** during restart — an unhandled rejection
  can crash the process. Wrap the restart call in `tryCatch` and log on failure.
- **Tokens must outlive a rotation.** `joinSession` issues tokens with a 24h `expireTime`
  (rotations happen ~every 8h) so reconnection after migration still authenticates.

## First: establish the target project's starting point (ASK before building)

This skill is reusable across projects, and the plumbing may or may not already exist.
Before writing any code, determine where the target project stands and ask the user if unclear:

1. **Does the backend already expose the webhook endpoints** `POST /hooks/session` and
   `POST /hooks/archive`? Search the codebase first (e.g. grep for `hooks/session`).
   - In the Vera repo (`vonage-video-react-app`) these **already exist** in
     `backend/routes/video/video.ts` — do not recreate them; extend/verify instead.
   - In a fresh consumer project they likely **do not exist** — create them from the
     Implementation checklist below.
2. **Are the Vonage callbacks registered** to point at those endpoints, and is session
   monitoring enabled? This is external config (see next section). Ask the user to confirm;
   if not registered, guide them through the dashboard steps.
3. **Does the project even have archiving as a feature?** This whole feature is meaningless
   without it: `/hooks/archive` describes the lifecycle of archives the app must be able to
   **start/stop** in the first place. Confirm the project has the Vonage REST calls (handlers/
   endpoints) for `startArchive` / `stopArchive` (search for `startArchive`); the restart helper
   reuses `startArchive`, so without it there is nothing to restart. Also confirm archiving is
   enabled on the Vonage side (project/application + account plan) with a storage/output target,
   and the app flag is on (here: `ALLOW_ARCHIVING`).

   **If archiving is missing, ASK the user whether they want to add it.** If yes, build the
   archiving REST-against-Vonage calls FIRST, following the existing patterns (see "Adding the
   archiving calls" below), then wire the hooks on top. If the user declines, stop — rotation
   recovery cannot be added meaningfully without archiving.
4. **Is there already session storage** with archive/rotation state, or must it be added?

State explicitly which of these already exist and which you will add, so work is not duplicated
when the skill runs against a repo that has part of the feature already.

> **HARD GATE — the webhooks + archiving are non-negotiable.** The entire feature is
> webhook-driven: server rotation is only detectable through `/hooks/session`
> (`reason: serverRotation`) and the restart is only triggered by `/hooks/archive` (`stopped`).
> If these endpoints do not exist AND are not registered+reachable in Vonage, or if the project
> cannot start archives at all, **nothing works** — the restart logic, storage, and middleware
> are all dead code. Treat this as step zero: ensure archiving works, create the endpoints, and
> get the Vonage callbacks registered (or confirm they already are) BEFORE implementing or
> claiming any restart behavior. Do not present the feature as working until it is verified end
> to end (a real or simulated `sessionDestroyed` + archive `stopped` actually reaches the backend
> and restarts the archive).

## Prerequisites — webhook/callback configuration (MUST be in place)

None of the backend logic runs unless Vonage is actually configured to call the `/hooks/*`
endpoints. These are configuration requirements, not code, and are easy to forget:

- **Register the callback URLs in the Vonage Application** (Video API project / application
  config, not in this repo's env files). Both must point at the backend's public base URL:
  - Session monitoring → `<PUBLIC_BACKEND_URL>/hooks/session`
  - Archive status → `<PUBLIC_BACKEND_URL>/hooks/archive`
- **Session monitoring must be enabled** on the application — the `sessionDestroyed` event with
  `reason: 'serverRotation'` is the trigger for the whole restart flow. Without it, migration
  goes undetected and archiving never restarts.
- **The backend must be publicly reachable** by Vonage (HTTPS, no auth wall on `/hooks/*`).
  Locally, use a tunnel (e.g. an ngrok-style HTTPS URL) and register that URL. On VCR the
  deployed instance URL is used.
- **Archiving must be enabled** (`ALLOW_ARCHIVING=true`) and the Vonage credentials present
  (`VONAGE_APP_ID`, `VONAGE_PRIVATE_KEY`, optional `VONAGE_VIDEO_HOST`).
- **Endpoints must ack fast with HTTP 200 even when skipped**, and be idempotent — Vonage
  retries on non-2xx and may redeliver. (Enforced in code; the config side just needs valid URLs.)

### How to register the callbacks in the Vonage dashboard (step by step)

Callback URLs are set in the Vonage Video API account portal, and **each type is configured
separately** — session and archive live in different sections.

1. Sign in to the Vonage Video API account portal and open the relevant **project/application**.
2. **Session monitoring** (this is the critical one for server rotation): find the *Session
   Monitoring* section, click *Configure*, and set the callback URL to
   `<PUBLIC_BACKEND_URL>/hooks/session`. This enables `sessionCreated`/`sessionDestroyed` (incl.
   `reason: serverRotation`), connection and stream events.
3. **Archive monitoring**: in the *Archive* section, set the archive status callback URL to
   `<PUBLIC_BACKEND_URL>/hooks/archive` (fires on `started`/`stopped`/`uploaded`/... transitions).
4. Save each section. Verify reachability by triggering a real session (create → destroy) or an
   archive start/stop and confirming the POST lands on your backend.
5. **Secure Callbacks (recommended):** Vonage offers signed callbacks so you can verify a request
   genuinely came from Vonage and was not tampered with. If enabled, validate the signature in the
   `/hooks/*` handlers. Treat this as the auth layer for the otherwise-public webhook endpoints.

URLs must be publicly reachable over HTTPS. Locally, expose the backend through a tunnel and
register that HTTPS URL; on VCR use the deployed instance URL. Sources (paraphrased, content
adjusted for licensing): Vonage docs on
[Session Monitoring](https://developer.vonage.com/en/opentok/guides/session-monitoring/overview),
[Archive Monitoring Callbacks](https://api.support.vonage.com/hc/en-us/articles/10636751570844-How-to-Configure-Archive-Monitoring-Callbacks),
and [Secure Callbacks](https://developer.vonage.com/en/opentok/guides/secure-callbacks).

Add these as explicit acceptance requirements when planning the feature: "the two webhooks are
registered and reachable, session monitoring is on, and a server rotation restarts the archive
exactly once." Note the endpoints are currently unauthenticated by design (Vonage webhooks);
if the deployment exposes them publicly, consider a shared-secret/signature check as a follow-up.

## Business & timing rules (easy to miss, decide explicitly)

- **The restart window is bounded (~30s).** In VCR storage the `serverRotationPending` flag is
  set with a **short 30s TTL**, while normal session/archive keys live ~4h. Rationale: the two
  webhooks (`/hooks/session` serverRotation → `/hooks/archive` stopped) arrive back-to-back; if
  the archive-stopped event does not arrive within that window the flag is considered stale and
  archiving is **not** restarted. This deliberately avoids resurrecting recordings long after a
  rotation. If you reimplement storage, preserve this short-TTL semantic (not the 4h one) for the
  pending flag.
- **Exactly one restart per rotation, one archive per session.** `archiveIds` is an array, but a
  rotation triggers a single `startArchive`, not one per previously-active archive. The flag is
  consumed (set to false / deleted) before restarting so concurrent webhook redeliveries can't
  double-start. This keeps recording continuous without multiplying archives (and cost).
- **Cost awareness.** Every restarted archive bills like a new recording. Restart only on genuine
  `serverRotation`; for any other `sessionDestroyed` reason, actively stop archives to avoid
  orphaned billable resources.
- **Recording resumes without re-consent.** After a rotation the recording continues seamlessly
  and participants are not re-prompted for consent (the consent dialog suppression on restart is a
  frontend concern, out of scope here, but it is a product/legal decision the backend restart
  enables). Confirm this is acceptable for the deployment's jurisdiction.
- **Storage entries are ephemeral.** Session/archive keys expire (~4h) and refresh on access;
  after expiry a room maps to a different session. Migration state must not assume permanence.

## Vonage webhooks — semantics you must know first

Understand the two hooks before writing any handler; the whole feature is driven by them.
Full reference: `backend/routes/video/VONAGE_HOOKS_CONCLUSIONS.md`.

- **`/hooks/session`** — session lifecycle. The definitive "session ended" signal is
  `event === 'sessionDestroyed'`; do NOT treat `connectionDestroyed` as the end (that is one
  participant leaving). The `reason` on `sessionDestroyed` drives behavior:
  - `serverRotation` → infrastructure migration; flag for restart, leave archives alone.
  - `clientDisconnected` / `forceDisconnected` / `mediaIdle` → real end; stop archives, clean up.
- **`/hooks/archive`** — archive state transitions. Recording ACTIVE = `started` / `paused`;
  recording FINISHED = `stopped`; post-process/storage = `uploaded` / `available` / `expired` /
  `failed`. For migration only `started` and `stopped` matter. The archive `stopped` event does
  **not** carry a usable `reason`, which is exactly why the session hook must persist the
  `serverRotation` flag as the bridge.

Cross-cutting rules for both: webhooks are **asynchronous, retried, and may arrive out of order
or be redelivered** — handle idempotently, use IDs (`sessionId`, archive `id`) as source of
truth, prefer state-machine style transitions, and always ack with HTTP 200 (even when the event
is skipped) so Vonage does not retry unnecessarily.

## Architecture / placement rules

- Agnostic Vonage Video orchestration (start/stop archive handlers) lives in `libs/api/src/handlers`.
- Vera/product-specific webhook wiring lives in `backend/routes/video/video.ts`.
- Restart-after-rotation product logic is a helper in `backend/routes/video/helpers/`.
- Session state persistence is behind the `SessionStorage` interface in `backend/storage/`.
- Follow AGENTS.md: fully descriptive names, `type` over `interface` (except real contracts
  like `SessionStorage`), linear code / early returns, IIFE for computed values, `tryCatch`
  over nested try/catch, named-parameter object args.

## Implementation checklist (build in this order)

### 1. Session storage contract (`backend/storage/sessionStorage.ts`)
Add to the `SessionStorage` interface the state needed for migration:
- `setArchiveIds({ sessionId, archiveIds })` / `getArchiveIds({ sessionId }): string[]`
- `setServerRotationPending({ sessionId, pending })` / `getServerRotationPending({ sessionId }): boolean`
- `getSessionKeyBySessionId({ sessionId }): string | null` (needed to restart via a sessionKey)
- Existing: `setSession`, `getSessionKeyByRoomName`.

Implement in every storage backend (`inMemorySessionStorage`, `vcrSessionStorage`).
`setServerRotationPending`/`getServerRotationPending` should no-op / default `false` when the
session is unknown rather than throw, since webhooks can arrive for evicted sessions. In VCR give
the pending flag the short ~30s TTL (see Business & timing rules).

### 2. Webhook payload schemas (`backend/routes/video/schemas/`)
Zod schemas, parsed with `assertResult(..., makeBadRequestErrorHandler(...))`:
- `SessionHookPayloadSchema` — `sessionId`, `event` (enum incl. `sessionDestroyed`), optional
  `reason`. Use `.loose()` so extra Vonage fields don't fail validation.
- `ArchiveHookPayloadSchema` — `id`, `sessionId`, `status` (enum incl. `started`/`stopped`), `.loose()`.

### 3. libs/api payload schema + handlers
- **`StopArchivePayloadSchema` (`libs/api/src/schemas/StopArchivePayload.schema.ts`) — make
  `archiveId` OPTIONAL** (`z.string().optional()`). This is the enabling change for the whole
  fallback: it lets the client omit `archiveId` (stale after a rotation) and lets the backend
  middleware inject the authoritative one. Without it, Zod rejects every stopArchive call that
  has no client-supplied id.
- `startArchive` (`libs/api/src/handlers/`) — decode `sessionKey` → `sessionId`, call
  `this.video.startArchive(...)`, wrap third-party errors with `makeThirdPartyErrorHandler` and
  internal with `makeInternalErrorHandler`. This same handler is reused for the automatic restart.
- `stopArchive` (`libs/api/src/handlers/`) — call `this.video.stopArchive(archiveId!)` (non-null
  assertion since the type is now optional but the middleware guarantees a value) with the same
  error wrapping.

### 4. Register handlers + middleware (`backend/routes/video/video.ts`)
- Register `createSession`, `joinSession`, `startArchive` in `handlersConfig`.
- `use$('stopArchive', ...)`: **archiveId resolution — storage is the source of truth.**
  After a rotation the archive restarts with a brand new id that the backend learns from the
  archive webhooks, while the client may still cache the old one. Decode `sessionKey` →
  `sessionId`, read stored `archiveIds`, then resolve with an IIFE:
  - storage empty → fall back to the client's `archiveId` (last resort);
  - client's id is present in storage → keep it;
  - client's id is stale (not in storage) or absent, and storage has ids → use `storedArchiveIds[0]`.
  Inject the resolved id into `input` before `next()`.
- `onSettled$` for `startArchive`: persist the new archive id into storage immediately
  (dedupe via `Set`) so `stopArchive` can find it without waiting for the webhook.
- `onSettled$` for create/join session: persist `{ sessionId, sessionKey, roomName }`.

### 5. The two webhooks (`backend/routes/video/video.ts`)
- `POST /hooks/session`: only act on `event === 'sessionDestroyed'`.
  - If `reason === 'serverRotation'` → `setServerRotationPending({ sessionId, pending: true })`
    and **leave archives running** (empty stop list).
  - Otherwise → stop all archiveIds via `Promise.allSettled`, then clear `archiveIds`.
- `POST /hooks/archive`: only act on `started` / `stopped`.
  - `started` → add id to `archiveIds` (Set dedupe).
  - `stopped` → remove id from `archiveIds`, then call `restartArchivingAfterServerRotation`.
- Wrap handler bodies in `assertResult(..., makeInternalErrorHandler(...))` and always
  `return res.status(200).send()` (ack webhooks even when skipped).

### 6. Restart helper (`backend/routes/video/helpers/restartArchivingAfterServerRotation.ts`)
```
if (!getServerRotationPending(sessionId)) return;      // fast-fail, only rotations
setServerRotationPending(sessionId, false);            // consume the flag (idempotent)
const sessionKey = getSessionKeyBySessionId(sessionId);
if (!sessionKey) return;
const { error } = await tryCatch(() => videoClient.startArchive({ sessionKey }));
if (error) console.error('[Error] Failed to restart archiving after server rotation', {...});
```
The `tryCatch` is mandatory: never reject inside a webhook handler.

## Adding the archiving calls (when the project lacks them)

If step 3 of the starting-point check found the project has no archiving calls and the user
agreed to add them, build these REST-against-Vonage handlers FIRST, then layer the hooks on top.
They are agnostic Vonage orchestration → they live in `libs/api/src/handlers` (per AGENTS.md), and
are exposed through the backend video router. Follow the existing handler pattern exactly.

**Handler pattern:** a function bound to `IVideoClient` that takes a typed payload, decodes the
`sessionKey` when a `sessionId` is needed, calls the Vonage SDK method on `this.video.*`, and
wraps errors with `assertResult` + `makeThirdPartyErrorHandler` (third-party failure) inside a
`try/catch` that rethrows via `makeInternalErrorHandler`.

- **`startArchive`** — `decodeSessionKey` → `sessionId`; `this.video.startArchive(sessionId, archiveOptions)`.
- **`stopArchive`** — `this.video.stopArchive(archiveId)`; keep `archiveId` OPTIONAL in the payload
  schema so the rotation middleware can inject the stored one.

**Wiring each new call** (do all of these or the action won't be reachable/validated):
1. Add the action to the `VideoAction` enum (`libs/api/src/types/VideoAction.ts`).
2. Create a Zod payload schema in `libs/api/src/schemas` and register it in
   `constants/schemasByAction.ts` (maps `VideoAction` → schema).
3. Implement the handler in `libs/api/src/handlers` and export it from `handlers/index.ts`.
4. Register defaults/config in the backend router `handlersConfig` (e.g. archive resolution
   `1280x720`, layout `bestFit`) in `backend/routes/video/video.ts`.
5. Confirm the account/project has archiving enabled and an output target configured.

Once these exist and work end to end (you can actually start and stop an archive), proceed to the
webhook + rotation-recovery implementation.

## End-to-end flow (server rotation happy path)

1. Rotation occurs → `/hooks/session` `sessionDestroyed` + `reason: serverRotation` →
   flag `serverRotationPending = true`, archives left running.
2. Vonage stops the archive → `/hooks/archive` `stopped` → remove id, call restart helper.
3. Restart helper sees the flag, clears it, resolves the `sessionKey`, calls `startArchive`.
4. New archive `started` webhook → id added back to storage. Recording continues.

For a normal (non-rotation) `sessionDestroyed`, step 1 instead stops all archives and clears
state, and the restart helper no-ops because the flag was never set.

## Testing guidance

Per AGENTS.md, favor a few high-value behavioral tests over input permutations:
- storage: archiveIds set/get/dedupe, serverRotationPending set/get, unknown-session safety.
- restart helper: no-op when flag unset; no-op when sessionKey missing; calls `startArchive`
  when flagged; swallows + logs errors (no rejection).
- webhook handlers: rotation path does NOT stop archives and sets the flag; non-rotation path
  stops archives and clears state; archive `stopped` triggers a single restart.
- stopArchive middleware: injects stored archiveId when client omits it or sends a stale one.
- `joinSession` default: token `expireTime` is ~24h ahead in epoch seconds.

Run backend tests with a single-run flag (no watch mode).

## Reference implementation (already present in this repo)

- `backend/routes/video/video.ts` — webhook wiring + middleware
- `backend/routes/video/helpers/restartArchivingAfterServerRotation.ts` — restart logic
- `backend/storage/sessionStorage.ts` + `inMemorySessionStorage` / `vcrSessionStorage`
- `libs/api/src/handlers/startArchive.ts`, `stopArchive.ts`
- `backend/routes/video/constants/joinSession.ts` — 24h token TTL
- `libs/api/src/schemas/StopArchivePayload.schema.ts` — `archiveId` made optional
- `libs/api/src/routing/videoRouter/createVideoRouter.ts` — applies `joinSession.addDefaults`
  (the 24h `expireTime` and role stripping now flow through `addDefaults`, not `transformInput`)
- `backend/routes/video/VONAGE_HOOKS_CONCLUSIONS.md` — webhook semantics reference
