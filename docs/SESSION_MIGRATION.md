## Session Migration

Session migration is the process by which Vonage transparently moves an active session from one media server to another (also known as **server rotation**). This is handled by Vonage's infrastructure and is invisible to participants — the session continues without interruption.

### Setup

Two changes are required to enable session migration support:

**Frontend** — set `sessionMigration: true` in `initSession`. This tells the Vonage SDK to participate in the migration process:

```ts
OT.initSession(applicationId, sessionId, { sessionMigration: true });
```

**Backend** — the webhook handlers (`/hooks/session`, `/hooks/archive`, `/hooks/captions`) must be reachable by Vonage. Configure the webhook URLs in the [Vonage API Dashboard](https://dashboard.vonage.com/applications) under your application settings, pointing to your deployed backend (e.g. `https://your-backend.example.com/v2/hooks/session`).

> **Developing this feature?** The recovery logic lives entirely in these webhook handlers, so iterating on it means editing the hooks and having Vonage call your **local** backend. Vonage can't reach `localhost`, so you need to expose it with a public tunnel. See [Testing Webhooks Locally with ngrok](#testing-webhooks-locally-with-ngrok) for the local setup.

### Affected Features

When a server rotation occurs, the following features are affected:

- **Archiving** — any active archive is stopped automatically by Vonage. Without intervention, the recording is permanently lost for the remainder of the session.
- **Captions** — any active captions session is stopped automatically by Vonage. The captions state is preserved in storage across the rotation, but automatic restart is not yet implemented.

#### Archiving Recovery

This application handles archiving recovery automatically: when a rotation is detected via the backend webhooks, the archive is restarted without requiring any action from participants. Additionally, the recording consent dialog is **not** shown again to participants who had already accepted it — only new participants who join after the restart will be prompted.

#### How it works

The key event is `POST /hooks/session` with `event: 'sessionDestroyed'` and `reason: 'serverRotation'`. When Vonage performs a server rotation, it destroys the current session and stops all active archives and captions — triggering their respective webhooks (`/hooks/archive` with `status: 'stopped'` and `/hooks/captions` with `status: 'stopped'`).

The backend uses this sequence:

1. `/hooks/session` arrives with `reason: 'serverRotation'` — the backend sets a `serverRotationPending` flag in session storage and does **not** clear archives or captions state.
2. `/hooks/archive` arrives with `status: 'stopped'` — the backend reads the flag, clears it, and calls `startArchive` to restart recording automatically.

The flag is the bridge between the session hook (which knows the rotation reason) and the archive hook (which does not carry a reason). Without it, there would be no way to distinguish a rotation stop from a manual stop.

---

#### Captions Recovery

Captions recovery after a server rotation is planned for a future release.

---

#### Triggering a server rotation manually (for testing)

Server rotation can be triggered from the [Vonage Video Playground](https://tools.vonage.com/video/playground):

1. Start a session in the application with at least one participant and an active archive.
2. Open the [Vonage Video Playground](https://tools.vonage.com/video/playground).
3. Enter your `applicationId` and the `sessionId` of the running session.
4. Connect to the session.
5. Click **"Migrate Session Now"**.

The backend will receive the rotation webhooks and automatically restart the archive.

> **Note:** The `sessionId` can be obtained from the browser network tab or from the backend logs when the session is created.

---

## Testing Webhooks Locally with ngrok

Session migration recovery is driven entirely by Vonage's webhooks (`/hooks/session`, `/hooks/archive`, `/hooks/captions`). Because Vonage's infrastructure calls these endpoints from the public internet, it cannot reach a backend running on `localhost`. To develop and test this feature locally, use **ngrok** to expose your local backend publicly and register that public URL as the webhook target in the Vonage Dashboard.

This is how we work on this feature: run everything locally, tunnel the backend through ngrok, point the application's webhooks at the tunnel, and then trigger a server rotation manually to watch the recovery flow run end to end against your local code.

1. Create an account at [ngrok](https://dashboard.ngrok.com/signup) if you haven't already, then follow the [Setup and Installation instructions](https://dashboard.ngrok.com/get-started/setup/) for your operating system.

2. **Start the application locally first:**

    ``` bash
    yarn dev
    ```

    Make sure both the backend server (port 3345) and frontend dev server (port 5173) are running before proceeding.

3. **Create secure tunnels for both frontend and backend.**

    First, find your ngrok config file location:

    ``` bash
    ngrok config check
    ```

    Create or edit the ngrok configuration file (typically located at `~/Library/Application Support/ngrok/ngrok.yml` on macOS; `~/.config/ngrok/ngrok.yml` on Linux and `%HOMEPATH%\AppData\Local\ngrok\ngrok.yml` on Windows) with the following content:

    ``` yaml
    version: "2"
    tunnels:
      frontend:
        addr: 5173
        proto: http
      backend:
        addr: 3345
        proto: http
    ```

    The **backend** tunnel is the important one for webhooks — it is the public URL Vonage will call. The **frontend** tunnel is only needed if you also want to test across multiple devices.

    **Start both tunnels:**

    ``` bash
    ngrok start backend frontend
    ```

    This creates publicly accessible HTTPS URLs for your frontend and backend. The output appears in your terminal, similar to the image below:

    <details close>
    <summary>ngrok output example</summary>
    <img src="./assets/readme/4-forwarding.png" alt="ngrok tunnel example" style="max-width: 100%; height: auto;" />
    </details>

    </br>

4. **Register the backend tunnel as your webhook (hooks) target in the Vonage Dashboard.**

    Open your application in the [Vonage API Dashboard](https://dashboard.vonage.com/applications) and set the webhook URLs to point at your backend ngrok domain, using the `/v2` prefix:

    | Webhook   | URL                                                        |
    | --------- | ---------------------------------------------------------- |
    | Session   | `https://your-backend-domain.ngrok.io/v2/hooks/session`    |
    | Archive   | `https://your-backend-domain.ngrok.io/v2/hooks/archive`    |
    | Captions  | `https://your-backend-domain.ngrok.io/v2/hooks/captions`   |

    With these in place, Vonage will deliver `sessionDestroyed` / `serverRotation`, archive `stopped`, and captions events straight to your local backend so you can step through the recovery logic.

    **Note:** ngrok assigns temporary domains on the free tier. You'll need to update these dashboard URLs each time the backend domain changes.

5. **Point the frontend at the tunnels** by updating [`vcrBuild.env.sh`](vcrBuild.env.sh):

    ``` bash
    export TUNNEL_DOMAIN=your-frontend-domain.ngrok.io
    export API_URL=https://your-backend-domain.ngrok.io
    ```

6. **Trigger a server rotation** using the [Vonage Video Playground](https://tools.vonage.com/video/playground) (see [Triggering a server rotation manually](#triggering-a-server-rotation-manually-for-testing) above) and watch the webhook calls arrive.

    Inspect the incoming requests in real time from the ngrok web inspector at [http://localhost:4040](http://localhost:4040), and correlate them with your backend logs to confirm the archive is restarted automatically.