import { Link } from 'react-router-dom';

function AppNavbar({ isLoggedIn, theme, onToggleTheme, profile }) {
  const username = profile?.username || 'User';
  const avatar = profile?.profileImage || 'https://via.placeholder.com/40x40.png?text=U';

  return (
    <nav className="navbar border-bottom app-navbar sticky-top">
      <div className="container-fluid px-3 px-lg-4 py-2">
        <div className="d-flex align-items-center gap-2">
          {isLoggedIn && (
            <button
              className="btn btn-outline-secondary btn-sm d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#appSidebarOffcanvas"
              aria-controls="appSidebarOffcanvas"
            >
              ☰
            </button>
          )}
          <Link className="navbar-brand fw-bold mb-0" to={isLoggedIn ? '/home' : '/login'}>
            Mates
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={onToggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {isLoggedIn && (
            <div className="d-flex align-items-center gap-2">
              <img src={avatar} alt="avatar" width="36" height="36" className="rounded-circle border" />
              <span className="fw-semibold small">{username}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
