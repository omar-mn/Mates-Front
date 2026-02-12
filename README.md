# Mates Front (React + Vite)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

3. Start app:

```bash
npm run dev
```

## Quick project notes

- **Theme location**: global dark-only theme styles are in `src/theme.css`.
- **Auth protection**:
  - Login stores token in `localStorage` key `accessToken`.
  - Protected pages (`/home`, `/profile`, `/updates`, `/settings`) use a protected route wrapper.
  - If there is no token, user is redirected to `/login`.
- **Logout locations**:
  - Sidebar → **Account** section → **Logout**
  - Settings page (`/settings`) → **Logout** button

## API functions

All API calls are in `src/api.js`:
- `registerUser`
- `loginUser`
- `getProfile`
- `getRooms`
- `createRoom`
