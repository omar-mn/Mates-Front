const DEFAULT_API_BASE = 'https://app-a83e9cdd-955a-4567-bc93-8f4629c1052b.cleverapps.io/api/';

const normalizeBase = (baseUrl) => {
  if (!baseUrl) return DEFAULT_API_BASE;
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

const API_BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE);

const parseApiError = async (response, fallbackMessage) => {
  const errorData = await response.json().catch(() => ({}));
  if (typeof errorData?.detail === 'string') return errorData.detail;

  const firstEntry = Object.values(errorData || {}).find((value) => Array.isArray(value) && value.length);
  if (firstEntry) return String(firstEntry[0]);

  return fallbackMessage;
};

export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken') || '';
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function registerUser({ username, email, password, confirmPassword }) {
  const response = await fetch(`${API_BASE_URL}auth/registration/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password1: password,
      password2: confirmPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Register failed'));
  }

  return response.json().catch(() => ({}));
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Login failed'));
  }

  const data = await response.json().catch(() => ({}));
  const accessToken = data.access || data.access_token || data.token || '';
  localStorage.setItem('accessToken', accessToken);
  return data;
}

export async function getProfile(token) {
  const response = await fetch(`${API_BASE_URL}users/info/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load profile'));
  }

  return response.json();
}

export async function getRooms() {
  const response = await fetch(`${API_BASE_URL}rooms/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load rooms'));
  }

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : data.results || [];
}

export async function createRoom(roomData) {
  const response = await fetch(`${API_BASE_URL}rooms/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to create room'));
  }

  return response.json().catch(() => ({}));
}

export async function getRoomDetails(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/modify/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load room details'));
  }

  return response.json();
}

export async function joinRoom(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/membership/${roomId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to join room'));
  }

  return response.json().catch(() => ({}));
}

export async function sendMessage(roomId, content) {
  const response = await fetch(`${API_BASE_URL}messages/send/${roomId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to send message'));
  }

  return response.json().catch(() => ({}));
}
