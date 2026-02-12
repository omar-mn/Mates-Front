import axios from 'axios';

// Vite exposes env vars through import.meta.env.
// We read VITE_API_BASE_URL so the same frontend can talk to different backends per environment.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

// Central axios client used by every API module.
// Keeping baseURL here avoids repeating '/api' across all requests.
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper used by auth flow to set/clear Authorization for all future requests.
// We update axios defaults so every API call automatically receives the latest token.
export const setClientToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;
