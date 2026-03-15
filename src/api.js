const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/';
const DEFAULT_WS_BASE = 'ws://127.0.0.1:8000/ws/';

const normalizeBase = (baseUrl, fallback) => {
  const value = baseUrl || fallback;
  return value.endsWith('/') ? value : `${value}/`;
};

export const API_BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE);

const deriveWsBaseFromApiBase = (apiBase) => {
  try {
    const parsed = new URL(apiBase);
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

export function getRoomSocketUrl(roomId) {
  const token = localStorage.getItem('accessToken') || '';
  // Room websocket endpoint used for real-time chat messages.
  const encodedToken = encodeURIComponent(token);
  return `${WS_BASE_URL}message/${roomId}/?token=${encodedToken}&access_token=${encodedToken}`;
}

// Register endpoint: POST /auth/registration/
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

// Login endpoint: POST /auth/login/ and save token for authenticated requests.
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Login failed'));

  const data = await response.json().catch(() => ({}));
  const token = data.key || data.token || data.access || data.access_token || '';

  if (!token) throw new Error('Login succeeded but token was missing in response.');
  localStorage.setItem('accessToken', token);

  return data;
}

// Reset password endpoint: POST /auth/password/reset/
export async function resetPassword(email) {
  const response = await fetch(`${API_BASE_URL}auth/password/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to send reset password request'));
  return response.json().catch(() => ({}));
}

// Authenticated user endpoint: GET /auth/user/
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}auth/user/`, {
    headers: {
      'Content-Type': 'application/json',
      // Authorization header uses stored token from login.
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load user profile'));
  return response.json().catch(() => ({}));
}

// Update current user endpoint: PUT/PATCH /auth/user/
export async function updateCurrentUser(payload) {
  const hasFile = Object.values(payload).some((value) => value instanceof window.File);

  const options = {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
    },
  };

  if (hasFile) {
    const formData = new window.FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    options.body = formData;
  } else {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`${API_BASE_URL}auth/user/`, options);

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to update profile'));
  return response.json().catch(() => ({}));
}

// Change password endpoint: POST /auth/password/change/
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

// Rooms list endpoint: GET /rooms/
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

// Create room endpoint: POST /rooms/create/
export async function createRoom(roomData) {
  const response = await fetch(`${API_BASE_URL}rooms/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to create room'));
  return response.json().catch(() => ({}));
}

// Room info endpoint: GET /rooms/<room_id>/
export async function getRoomDetails(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/${roomId}/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to load room details'));
  return response.json().catch(() => ({}));
}

// Join/leave toggle endpoint: POST /rooms/join/<room_id>/
export async function toggleRoomMembership(roomId) {
  const response = await fetch(`${API_BASE_URL}rooms/join/${roomId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to update room membership'));
  return response.json().catch(() => ({}));
}

// Edit room endpoint: PATCH /rooms/modify/<room_id>/
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

// Delete room endpoint: DELETE /rooms/modify/<room_id>/
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

// Room messages endpoint: GET /messages/<room_id>/
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

// Edit message endpoint: PUT /messages/mod/<room_id>/<message_id>/
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

// Delete message endpoint: DELETE /messages/del/<room_id>/<message_id>/
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
