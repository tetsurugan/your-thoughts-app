# Your Thoughts Backend

Node.js + Express + Prisma + SQLite.

## Setup

1.  **Install**:
    ```bash
    npm install
    npx prisma generate
    ```

2.  **Database**:
    A local `dev.db` file is used (SQLite).
    To reset: `npx prisma migrate reset`

3.  **Google Calendar API**:
    To create events, you need a Google Cloud Project with the Calendar API enabled.
    1.  Go to [Google Cloud Console](https://console.cloud.google.com).
    2.  Create a project -> APIs & Services -> Enable "Google Calendar API".
    3.  Credentials -> Create OAuth Client ID -> Web Application.
    4.  **Redirect URI**: `http://localhost:3001/api/calendar/google/callback`
    5.  Copy the Client ID and Secret to `.env`:
        ```env
        GOOGLE_CLIENT_ID=...
        GOOGLE_CLIENT_SECRET=...
        GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/google/callback
        ```

4.  **Run**:
    ```bash
    npm run dev
    ```
    API: `http://localhost:3001`
