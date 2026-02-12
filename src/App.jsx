import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getProfile } from './api';
import AppNavbar from './components/AppNavbar';
import AppSidebar from './components/AppSidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Updates from './pages/Updates';

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [profile, setProfile] = useState(null);
  const [apiStatus, setApiStatus] = useState('connected');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [createRoomRequest, setCreateRoomRequest] = useState(0);
  const [refreshRoomsRequest, setRefreshRoomsRequest] = useState(0);

  const isLoggedIn = Boolean(token);

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

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('accessToken') || '');
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken('');
    setProfile(null);
    navigate('/login');
  };

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
      <AppNavbar isLoggedIn={isLoggedIn} profile={profile} />

      {isLoggedIn && (
        <AppSidebar
          apiStatus={apiStatus}
          onCreateRoom={handleCreateRoom}
          onRefreshRooms={handleRefreshRooms}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onLogout={handleLogout}
        />
      )}

      <main className={isLoggedIn ? 'app-main with-sidebar' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/home" replace /> : <Register />} />
          <Route
            path="/home"
            element={(
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Home
                  selectedCategory={selectedCategory}
                  createRoomRequest={createRoomRequest}
                  refreshRoomsRequest={refreshRoomsRequest}
                  onApiStatusChange={setApiStatus}
                />
              </ProtectedRoute>
            )}
          />
          <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Profile /></ProtectedRoute>} />
          <Route path="/updates" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Updates /></ProtectedRoute>} />
          <Route
            path="/settings"
            element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings onLogout={handleLogout} /></ProtectedRoute>}
          />
          <Route
            path="/help"
            element={<ProtectedRoute isLoggedIn={isLoggedIn}><PlaceholderPage title="Help" description="Help and FAQ content is coming soon." /></ProtectedRoute>}
          />
          <Route
            path="/about"
            element={<ProtectedRoute isLoggedIn={isLoggedIn}><PlaceholderPage title="About" description="About this app page is coming soon." /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
