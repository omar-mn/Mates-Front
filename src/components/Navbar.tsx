import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { cn } from '../utils/helpers';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200');

const Navbar = () => {
  const { accessToken, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={accessToken ? '/home' : '/login'} className="text-lg font-bold text-slate-900">
          Mates Rooms
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/home" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/updates" className={navLinkClass}>
            Updates
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>
        </div>

        {accessToken && user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-2 py-1 sm:flex">
              <Avatar src={user.profileImage} alt={user.username} fallbackText={user.username} className="h-8 w-8" />
              <span className="text-sm font-medium text-slate-700">{user.username}</span>
            </div>
            <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link to="/register" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
