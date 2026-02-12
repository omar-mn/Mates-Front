import apiClient from './client';

// Register creates a new account using email + password.
// The backend handles validation and returns errors when fields are invalid.
export const registerUser = async (payload) => {
  await apiClient.post('/users/register/', payload);
};

// Login exchanges credentials for JWT tokens.
// We keep this request isolated so the auth context can decide what to store.
export const loginUser = async (payload) => {
  const { data } = await apiClient.post('/users/token/', payload);
  return data;
};

// On app startup we call /users/info/ to restore who the current user is.
// This relies on Authorization being attached by setClientToken/interceptors.
export const fetchUserInfo = async () => {
  const { data } = await apiClient.get('/users/info/');
  return data.userData;
};
