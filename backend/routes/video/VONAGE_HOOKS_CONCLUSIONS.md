# Vonage Video Hooks: Practical Conclusions

This document summarizes when each Vonage webhook is called and how to interpret it in product logic.

## 1) Session Hook (`/hooks/session`)

This callback receives session lifecycle and activity events such as:

- `sessionCreated`
- `sessionDestroyed`
- `sessionNotification`
- `connectionCreated`
- `connectionDestroyed`
- `streamCreated`
- `streamDestroyed`

### When is the session really finished?

Use `event === "sessionDestroyed"` as the definitive "session ended" signal.

Do not treat `connectionDestroyed` as "session ended". It only means one participant disconnected.

### Useful `reason` values for `sessionDestroyed`

- `clientDisconnected`: all clients left
- `forceDisconnected`: forced timeout/disconnect/server issue
- `mediaIdle`: no media activity
- `serverRotation`: infrastructure rotation

## 2) Captions Hook (`/hooks/captions`)

This callback receives live captions state changes for a captions job in a session.

Expected statuses:

- `started`
- `transcribing`
- `stopped`
- `failed`

### How to separate active vs disabled?

Treat these as ACTIVE:

- `started`
- `transcribing`

Treat these as NOT ACTIVE:

- `stopped`
- `failed`

### Recommended product behavior

- `started`: captions resources allocated; mark as booting/active
- `transcribing`: captions are actively flowing
- `stopped`: normal end; clear captions active state
- `failed`: error end; clear active state and optionally trigger retry UX/alerts

## 3) Archive Hook (`/hooks/archive`)

This callback receives archive recording state transitions.

Common statuses:

- `started`: recording in progress
- `paused`: no streams currently recorded
- `stopped`: recording ended
- `uploaded`: uploaded to your configured storage
- `available`: available from Vonage storage fallback
- `expired`: fallback file no longer available
- `failed`: recording or upload failed
- `streamAdded` / `streamRemoved`: stream composition updates (manual stream mode)

### How to separate recording active vs finished?

Treat as RECORDING ACTIVE:

- `started`
- `paused` (still same archive lifecycle, temporarily idle)

Treat as RECORDING FINISHED:

- `stopped`

Treat as POST-PROCESS/STORAGE states:

- `uploaded`
- `available`
- `expired`
- `failed`

## 4) Operational Rules (Short Version)

- Session truly ended: `sessionDestroyed`
- Captions active: `started` or `transcribing`
- Captions ended: `stopped` or `failed`
- Archive recording active: `started`/`paused`
- Archive recording ended: `stopped`
- Archive retrievable state: usually `uploaded` or `available`

## 5) Important Notes

- Webhooks are asynchronous and can arrive with retries. Handle idempotently.
- Use IDs (`sessionId`, `captionId/captionsId`, `archive id`) as source-of-truth for state transitions.
- Prefer state-machine style transitions to avoid ambiguity in UI and backend cleanup logic.
