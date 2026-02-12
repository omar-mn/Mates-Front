import apiClient from './client';

// Fetches rooms for a specific page.
// Backend may return either a plain array or a paginated object depending on endpoint config.
export const listRooms = async (page = 1) => {
  const { data } = await apiClient.get('/rooms/', {
    params: { page },
  });
  return data;
};

// Creates a new room on the server.
// The page triggers list refresh after success so UI stays in sync with backend.
export const createRoom = async (payload) => {
  const { data } = await apiClient.post('/rooms/create/', payload);
  return data;
};
