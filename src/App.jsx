import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getProfile } from './api';
import AppNavbar from './components/AppNavbar';
import AppSidebar from './components/AppSidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Updates from './pages/Updates';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const token = localStorage.getItem('accessToken');
  const [profile, setProfile] = useState(null);
  const [apiStatus, setApiStatus] = useState('connected');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [createRoomRequest, setCreateRoomRequest] = useState(0);
  const [refreshRoomsRequest, setRefreshRoomsRequest] = useState(0);

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token && location.pathname === '/') {
      window.location.replace('/login');
    }
  }, [location.pathname, token]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const data = await getProfile(token);
        setProfile(data.userData || null);
        setApiStatus('connected');
      } catch (err) {
        setApiStatus('error');
      }
    };

    loadProfile();
  }, [token]);

  const handleCreateRoom = () => {
    navigate('/home');
    setCreateRoomRequest((prev) => prev + 1);
  };

  const handleRefreshRooms = () => {
    navigate('/home');
    setRefreshRoomsRequest((prev) => prev + 1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate('/home');
  };

  return (
    <>
      <AppNavbar
        isLoggedIn={Boolean(token)}
        profile={profile}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {token && (
        <AppSidebar
          apiStatus={apiStatus}
          onCreateRoom={handleCreateRoom}
          onRefreshRooms={handleRefreshRooms}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      )}

      <main className={token ? 'app-main with-sidebar' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/home' : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={(
              <ProtectedRoute>
                <Home
                  selectedCategory={selectedCategory}
                  createRoomRequest={createRoomRequest}
                  refreshRoomsRequest={refreshRoomsRequest}
                  onApiStatusChange={setApiStatus}
                />
              </ProtectedRoute>
            )}
          />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/updates" element={<ProtectedRoute><Updates /></ProtectedRoute>} />
          <Route
            path="/settings"
            element={<ProtectedRoute><PlaceholderPage title="Settings" description="Preferences panel coming soon (theme, language, and more)." /></ProtectedRoute>}
          />
          <Route
            path="/help"
            element={<ProtectedRoute><PlaceholderPage title="Help / FAQ" description="Helpful guides and frequently asked questions will appear here." /></ProtectedRoute>}
          />
          <Route
            path="/about"
            element={<ProtectedRoute><PlaceholderPage title="About Mates" description="Mates helps you discover and join rooms for your interests." /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to={token ? '/home' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
