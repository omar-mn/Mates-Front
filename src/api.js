const BACKEND_ORIGIN = 'http://127.0.0.1:8000';
const DEFAULT_API_BASE = `${BACKEND_ORIGIN}/api/`;
const DEFAULT_WS_BASE = 'ws://127.0.0.1:8000/ws/';
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=User&background=6f33df&color=fff';

const normalizeBase = (baseUrl, fallback) => {
  const value = baseUrl || fallback;
  return value.endsWith('/') ? value : `${value}/`;
};

export const API_BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE);
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const deriveWsBaseFromApiBase = (apiBase) => {
  try {
    const parsed = new window.URL(apiBase);
    const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${parsed.host}/ws/`;
  } catch {
    return DEFAULT_WS_BASE;
  }
};

export const WS_BASE_URL = normalizeBase(
  import.meta.env.VITE_WS_BASE_URL,
  deriveWsBaseFromApiBase(API_BASE_URL),
);

const getErrorMessageFromObject = (errorData, fallbackMessage) => {
  if (!errorData || typeof errorData !== 'object') return fallbackMessage;
  if (typeof errorData.detail === 'string') return errorData.detail;
  if (typeof errorData.message === 'string') return errorData.message;
  if (typeof errorData.error === 'string') return errorData.error;

  const firstKey = Object.keys(errorData)[0];
  const firstValue = firstKey ? errorData[firstKey] : null;

  if (Array.isArray(firstValue) && firstValue.length) return String(firstValue[0]);
  if (typeof firstValue === 'string') return firstValue;

  return fallbackMessage;
};

const parseApiError = async (response, fallbackMessage) => {
  const errorData = await response.json().catch(() => ({}));
  return getErrorMessageFromObject(errorData, fallbackMessage);
};

export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken') || '';
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function resolveMediaUrl(url, fallback = FALLBACK_AVATAR) {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BACKEND_BASE_URL}${url}`;
  return fallback;
}

export function getRoomSocketUrl(roomId) {
  const token = localStorage.getItem('accessToken') || '';
  const encodedToken = encodeURIComponent(token);
  return `${WS_BASE_URL}message/${encodeURIComponent(roomId)}/?token=${encodedToken}`;
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

  if (!response.ok) throw new Error(await parseApiError(response, 'Register failed'));
  return response.json().catch(() => ({}));
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Login failed'));

  const data = await response.json().catch(() => ({}));
  const accessToken = data.key || data.token || data.access || data.access_token || '';
  const refreshToken = data.refresh || data.refresh_token || '';

  if (!accessToken) throw new Error('Login succeeded but token was missing in response.');

  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

  return data;
}

export async function resetPassword(email) {
  const response = await fetch(`${API_BASE_URL}auth/password/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to send reset password request'));
  return response.json().catch(() => ({}));
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}auth/user/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load user profile'));
  return response.json().catch(() => ({}));
}

export async function updateCurrentUser(payload) {
  const response = await fetch(`${API_BASE_URL}auth/user/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to update profile'));
  return response.json().catch(() => ({}));
}

export async function changePassword({ newPassword1, newPassword2 }) {
  const response = await fetch(`${API_BASE_URL}auth/password/change/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      new_password1: newPassword1,
      new_password2: newPassword2,
    }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to change password'));
  return response.json().catch(() => ({}));
}

export async function getRooms() {
  const response = await fetch(`${API_BASE_URL}rooms/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load rooms'));

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
    body: JSON.stringify({
      ...roomData,
      private: Boolean(roomData.private),
    }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to create room'));
  return response.json().catch(() => ({}));
}

export async function getRoomDetails(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/room/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load room details'));
  return response.json().catch(() => ({}));
}

export async function joinRoom(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/join/${roomId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to join room'));
  return response.json().catch(() => ({}));
}

export async function leaveRoom(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/leave/${roomId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to leave room'));
  return response.json().catch(() => ({}));
}

export async function getPendingRequests(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/pendingrequsts/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load pending requests'));
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : data.results || [];
}

export async function getOldRequests(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/oldrequsts/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load old requests'));
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : data.results || [];
}

export async function handleRoomRequest(roomId, requestId, state) {
  const response = await fetch(`${API_BASE_URL}rooms/reqhandel/${roomId}/${requestId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, `Failed to mark request as ${state}`));
  return response.json().catch(() => ({}));
}

export async function updateRoom(roomId, payload) {
  const response = await fetch(`${API_BASE_URL}rooms/modify/${roomId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to update room'));
  return response.json().catch(() => ({}));
}

export async function deleteRoom(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/modify/${roomId}/`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to delete room'));
  return true;
}

export async function getRoomMessages(roomId) {
  const response = await fetch(`${API_BASE_URL}messages/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load messages'));
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function updateMessage(roomId, messageId, content) {
  const response = await fetch(`${API_BASE_URL}messages/mod/${roomId}/${messageId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to edit message'));
  return response.json().catch(() => ({}));
}

export async function deleteMessage(roomId, messageId) {
  const response = await fetch(`${API_BASE_URL}messages/del/${roomId}/${messageId}/`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to delete message'));
  return true;
}
