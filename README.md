# Mates Front (Beginner Friendly)

This is a simplified React + Vite frontend with these pages:
- Login
- Register
- Home (rooms list + create room)
- Profile
- Updates

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

## Dark mode

- Navbar has a **🌙 Dark Mode** toggle.
- Theme value is saved in `localStorage` with key `theme` (`light` or `dark`).
- Body gets class `theme-light` or `theme-dark`.
- Styles are in `src/theme.css`.

## API functions

All API calls are in `src/api.js`:
- `registerUser`
- `loginUser`
- `getProfile`
- `getRooms`
- `createRoom`

Token is saved in `localStorage` (`accessToken`, `refreshToken`) after login.
