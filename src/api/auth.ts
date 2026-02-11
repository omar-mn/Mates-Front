import apiClient from './client';

export type UserData = {
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profileImage: string | null;
};

type RegisterPayload = { email: string; password: string };
type LoginPayload = RegisterPayload;
type LoginResponse = { access: string; refresh: string };
type UserInfoResponse = { userData: UserData };

export const registerUser = async (payload: RegisterPayload) => {
  await apiClient.post('/users/register/', payload);
};

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>('/users/token/', payload);
  return data;
};

export const fetchUserInfo = async () => {
  const { data } = await apiClient.get<UserInfoResponse>('/users/info/');
  return data.userData;
};
