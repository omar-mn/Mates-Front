const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function registerUser(email, password) {
  // We call POST /api/users/register/ to create a brand new account.
  const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Register failed');
  }

  return response.json().catch(() => ({}));
}

export async function loginUser(email, password) {
  // We call POST /api/users/token/ to get access + refresh tokens for auth.
  const response = await fetch(`${API_BASE_URL}/api/users/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  const data = await response.json();
  // We store token values in localStorage so page refresh keeps the user logged in.
  localStorage.setItem('accessToken', data.access || '');
  localStorage.setItem('refreshToken', data.refresh || '');
  return data;
}

export async function getProfile(token) {
  // We call GET /api/users/info/ for profile data and send Authorization so server knows who we are.
  const response = await fetch(`${API_BASE_URL}/api/users/info/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to load profile');
  }

  // We return API data so the page can setProfile(...) and re-render UI.
  return response.json();
}

export async function getRooms(token, page = 1) {
  // We call GET /api/rooms/?page=... to load room list; auth header is attached directly here (no interceptors).
  const response = await fetch(`${API_BASE_URL}/api/rooms/?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to load rooms');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    // If API returns a plain array, we still normalize it so pages can update state in one format.
    return {
      rooms: data,
      next: null,
      previous: null,
      count: data.length,
    };
  }

  return {
    rooms: data.results || [],
    next: data.next || null,
    previous: data.previous || null,
    count: data.count || 0,
  };
}

export async function createRoom(token, roomData) {
  // We call POST /api/rooms/create/ and include Authorization because creating a room needs a logged-in user.
  const response = await fetch(`${API_BASE_URL}/api/rooms/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create room');
  }

  // We return the new room so Home page can add/update room state immediately.
  return response.json();
}
