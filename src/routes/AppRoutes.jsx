import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import Updates from '../pages/Updates';

const RootRedirect = () => {
  const { accessToken } = useAuth();
  return <Navigate to={accessToken ? '/home' : '/login'} replace />;
};

const AppRoutes = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/updates" element={<Updates />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  </div>
);

export default AppRoutes;
