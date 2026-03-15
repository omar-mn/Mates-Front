import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { getCurrentUser } from './api';
import AppNavbar from './components/AppNavbar';
import AppSidebar from './components/AppSidebar';
import ToastHost from './components/ToastHost';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RoomDetails from './pages/RoomDetails';
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const toastTimerRef = useRef(null);

  const isLoggedIn = Boolean(token);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  };

  useEffect(() => () => {
    window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const data = await getCurrentUser();
        setProfile(data || null);
        setApiStatus('connected');
      } catch (err) {
        setApiStatus('error');
        localStorage.removeItem('accessToken');
        setToken('');
        setProfile(null);
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
    setToken('');
    setProfile(null);
    showToast('You have been logged out.', 'info');
    navigate('/login');
  };

  return (
    <>
      <AppNavbar isLoggedIn={isLoggedIn} profile={profile} />

      {isLoggedIn && (
        <AppSidebar
          apiStatus={apiStatus}
          onCreateRoom={() => {
            navigate('/home');
            setCreateRoomRequest((prev) => prev + 1);
          }}
          onRefreshRooms={() => {
            navigate('/home');
            setRefreshRoomsRequest((prev) => prev + 1);
          }}
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            navigate('/home');
          }}
          onLogout={handleLogout}
        />
      )}

      <main className={isLoggedIn ? 'app-main with-sidebar' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/home" replace /> : <Register showToast={showToast} />} />
          <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/home" replace /> : <ForgotPassword showToast={showToast} />} />
          <Route
            path="/home"
            element={(
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Home
                  currentUser={profile}
                  selectedCategory={selectedCategory}
                  createRoomRequest={createRoomRequest}
                  refreshRoomsRequest={refreshRoomsRequest}
                  onApiStatusChange={setApiStatus}
                  showToast={showToast}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/room/:id"
            element={(
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RoomDetails
                  currentUser={profile}
                  onApiStatusChange={setApiStatus}
                  showToast={showToast}
                />
              </ProtectedRoute>
            )}
          />
          <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Profile currentUser={profile} setCurrentUser={setProfile} showToast={showToast} /></ProtectedRoute>} />
          <Route path="/updates" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Updates /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings onLogout={handleLogout} showToast={showToast} /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PlaceholderPage title="Help" description="Help and FAQ content is coming soon." /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PlaceholderPage title="About" description="About this app page is coming soon." /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />} />
        </Routes>
      </main>
      <ToastHost toast={toast} />
    </>
  );
}

export default App;
