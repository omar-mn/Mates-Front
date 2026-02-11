import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { setClientToken } from '../api/client';
import { fetchUserInfo, loginUser, type UserData } from '../api/auth';
import { useToast } from '../components/ToastProvider';
import { toFriendlyError } from '../utils/helpers';

type AuthContextValue = {
  accessToken: string | null;
  user: UserData | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const STORAGE_KEY = 'accessToken';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<UserData | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
    setClientToken(null);
    navigate('/login');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const userInfo = await fetchUserInfo();
    setUser(userInfo);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginUser({ email, password });
      localStorage.setItem(STORAGE_KEY, tokens.access);
      setAccessToken(tokens.access);
      setClientToken(tokens.access);
      await refreshUser();
      pushToast('Logged in successfully', 'success');
      navigate('/home');
    },
    [navigate, pushToast, refreshUser],
  );

  useEffect(() => {
    setClientToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          pushToast('Session expired, please login again.', 'error');
          logout();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, logout, pushToast]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken) {
        setIsBootstrapping(false);
        return;
      }
      try {
        await refreshUser();
      } catch (error) {
        pushToast(toFriendlyError(error, 'Unable to restore session'), 'error');
        logout();
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [accessToken, logout, pushToast, refreshUser]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isBootstrapping,
      login,
      logout,
      refreshUser,
    }),
    [accessToken, isBootstrapping, login, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
