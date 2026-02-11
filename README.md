# Mates Frontend SPA

Production-ready React + TypeScript + Tailwind SPA for chat rooms, auth, profile, and roadmap pages.

## Setup

1. Install dependencies

```bash
npm i
```

2. Create `.env` file

```bash
VITE_API_BASE_URL="http://127.0.0.1:8000"
```

3. Run development server

```bash
npm run dev
```

## Implemented Features

- Register and Login flows backed by `/api/users/register/` and `/api/users/token/`.
- Auth context with session restore via `/api/users/info/`.
- Axios client with auth header + 401 auto-logout handling.
- Rooms list and create room modal (`/api/rooms/`, `/api/rooms/create/`).
- Supports both array and paginated rooms responses.
- Protected pages (`/home`, `/profile`), plus `/updates` placeholder roadmap.
- UI-only stubs for join flow, room actions dropdown, and joined rooms.
