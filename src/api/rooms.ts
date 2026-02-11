import apiClient from './client';

export type Room = {
  name: string;
  description: string;
  category: string;
  owner: {
    username: string;
    profileImage: string | null;
  };
};

export type RoomsResponse =
  | Room[]
  | {
      count: number;
      next: string | null;
      previous: string | null;
      results: Room[];
    };

export type CreateRoomPayload = {
  name: string;
  category: string;
  description?: string;
};

export const listRooms = async (page = 1) => {
  const { data } = await apiClient.get<RoomsResponse>('/rooms/', {
    params: { page },
  });
  return data;
};

export const createRoom = async (payload: CreateRoomPayload) => {
  const { data } = await apiClient.post('/rooms/create/', payload);
  return data;
};
