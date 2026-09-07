## Session Migration

Session migration is the process by which Vonage transparently moves an active session from one media server to another (also known as **server rotation**). This is handled by Vonage's infrastructure and is invisible to participants — the session continues without interruption.

### Setup

Two changes are required to enable session migration support:

**Frontend** — set `sessionMigration: true` in `initSession`. This tells the Vonage SDK to participate in the migration process:

```ts
OT.initSession(applicationId, sessionId, { sessionMigration: true });
```

**Backend** — the webhook handlers (`/hooks/session`, `/hooks/archive`, `/hooks/captions`) must be reachable by Vonage. Configure the webhook URLs in the [Vonage API Dashboard](https://dashboard.vonage.com/applications) under your application settings, pointing to your deployed backend (e.g. `https://your-backend.example.com/v2/hooks/session`).

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

## Testing on Multiple Devices

To test the video API across multiple devices on your local network, you can use **ngrok** to expose your frontend and backend publicly.

1. Create an account at [ngrok](https://dashboard.ngrok.com/signup) if you haven't already.

2. Follow the [Setup and Installation instructions](https://dashboard.ngrok.com/get-started/setup/) for your operating system to install and configure ngrok.

3. **Start the application locally first:**

    ``` bash
    yarn dev
    ```

    Make sure both the backend server (port 3345) and frontend dev server (port 5173) are running before proceeding to the next step.

4. Create secure tunnels for both frontend and backend:

    **Set up ngrok configuration:**
    
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

    **Start both tunnels:**
    ``` bash
    ngrok start backend frontend
    ```

    This command will create publicly accessible HTTPS URLs for both your frontend and backend. The output will appear in your terminal, similar to the image below:

    <details close>
    <summary>ngrok output example</summary>
    <img src="./docs/assets/readme/4-forwarding.png" alt="ngrok tunnel example" style="max-width: 100%; height: auto;" />
    </details>

    </br>

5. Copy the domains from both outputs and update [`vcrBuild.env.sh`](vcrBuild.env.sh):

    ``` bash
    export TUNNEL_DOMAIN=your-frontend-domain.ngrok.io
    export API_URL=https://your-backend-domain.ngrok.io
    ```

    **Note:** ngrok assigns temporary domains. You'll need to update these values each time the domains change.

  </br>

6. Open the provided frontend **Forwarding** URL in your browser. This exposes your entire application publicly, allowing devices on any network to access it.