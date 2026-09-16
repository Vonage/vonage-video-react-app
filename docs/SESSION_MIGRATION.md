## Session Migration

This document describes how the Reference App handles server migration and how the archive recovery flow is implemented.

> For what session migration (server rotation) is and how it behaves at the platform level, see the [Vonage Session Migration guide](https://developer.vonage.com/en/video/guides/session-migration). This document only covers **how this Reference App implements recovery** when a rotation happens.

When Vonage rotates the media server of an active session, it stops any in-progress archive. This app detects that rotation and restarts archiving automatically, so recording continues without any action from participants.

### Enabling it

**Frontend** — enable session migration on the SDK when creating the session:

```ts
OT.initSession(applicationId, sessionId, { sessionMigration: true });
```

**Backend** — expose the webhook handlers (`/hooks/session`, `/hooks/archive`) and register their URLs in the [Vonage API Dashboard](https://dashboard.vonage.com/applications), pointing at your deployed backend (e.g. `https://your-backend.example.com/v2/hooks/session`). These webhooks drive the whole recovery flow.

### How recovery is implemented

Recovery relies on two webhooks arriving in sequence. The challenge is that the archive-stopped webhook carries **no reason**, so on its own it's indistinguishable from a user manually stopping the recording. The app bridges the two events with a `serverRotationPending` flag in session storage:

```
/hooks/session  (sessionDestroyed, reason: serverRotation)
        │
        ▼
  set serverRotationPending = true        ← remember "this stop is a rotation"
        │
        ▼
/hooks/archive  (status: stopped)
        │
        ▼
  serverRotationPending set?
        ├── yes → clear flag, call startArchive()   ← restart recording
        └── no  → treat as an intentional stop, do nothing
```

1. `/hooks/session` arrives with `event: 'sessionDestroyed'` and `reason: 'serverRotation'`. The backend sets `serverRotationPending` and deliberately does **not** clear the archive state.
2. `/hooks/archive` arrives with `status: 'stopped'`. The backend checks the flag: if set, it clears it and calls `startArchive` to resume recording; otherwise it treats the stop as intentional.

The flag is what makes a rotation-triggered stop distinguishable from a manual stop — without it there would be no way to tell them apart, and the app would either never restart or restart on every manual stop.

On the frontend, participants who already accepted the recording consent are **not** prompted again after the automatic restart; only participants who join afterwards see the consent dialog.

### Current limitations

- **Captions are not recovered.** A rotation also stops any active captions session. The captions state is preserved in storage, but automatic restart is not yet implemented.

### Testing the recovery flow locally

Because Vonage calls the webhooks from the public internet, it can't reach a backend on `localhost`. Use **ngrok** (or an equivalent tunneling service) to expose your local backend and register that URL as the webhook target.

1. Start the app locally (`yarn dev`) — backend on port `3345`, frontend on `5173`.

2. Tunnel the backend with [ngrok](https://dashboard.ngrok.com/get-started/setup/):

    ``` bash
    ngrok http 3345
    ```

3. In the [Vonage API Dashboard](https://dashboard.vonage.com/applications), point the webhook URLs at the tunnel:

    | Webhook | URL                                                     |
    | ------- | ------------------------------------------------------- |
    | Session | `https://your-backend-domain.ngrok.io/v2/hooks/session` |
    | Archive | `https://your-backend-domain.ngrok.io/v2/hooks/archive` |

    ngrok assigns a new domain each restart on the free tier, so update these URLs whenever it changes.

4. Trigger a rotation from the [Vonage Video Playground](https://tools.vonage.com/video/playground): connect to the running session using its `applicationId` and `sessionId` (from the browser network tab or backend logs), then click **"Migrate Session Now"**.

5. Confirm recovery: watch the incoming webhooks in the ngrok inspector at [http://localhost:4040](http://localhost:4040) and check the backend logs to verify `startArchive` is called after the archive-stopped event.
