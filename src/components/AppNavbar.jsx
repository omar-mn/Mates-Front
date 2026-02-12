import { Link, useNavigate } from 'react-router-dom';

function AppNavbar({ isLoggedIn, theme, onToggleTheme }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom app-navbar">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold" to={isLoggedIn ? '/home' : '/login'}>
          Mates
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/home">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/updates">Updates</Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={onToggleTheme}>
              🌙 Dark Mode: {theme === 'dark' ? 'On' : 'Off'}
            </button>

            {!isLoggedIn && <Link className="btn btn-primary btn-sm rounded-3" to="/login">Login</Link>}
            {isLoggedIn && <button className="btn btn-danger btn-sm rounded-3" onClick={logout}>Logout</button>}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
