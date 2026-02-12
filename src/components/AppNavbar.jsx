import { Link } from 'react-router-dom';

function AppNavbar({ isLoggedIn, profile }) {
  const username = profile?.username || 'User';
  const avatar = profile?.profileImage || 'https://via.placeholder.com/40x40.png?text=U';

  return (
    <nav className="navbar border-bottom app-navbar sticky-top">
      <div className="container-fluid px-3 px-lg-4 py-2">
        <div className="d-flex align-items-center gap-2">
          {isLoggedIn && (
            <button
              className="btn sidebar-toggle d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#appSidebarOffcanvas"
              aria-controls="appSidebarOffcanvas"
            >
              <i className="bi bi-list" />
            </button>
          )}
          <Link className="navbar-brand fw-bold mb-0" to={isLoggedIn ? '/home' : '/login'}>
            Mates
          </Link>
        </div>

        {isLoggedIn && (
          <div className="d-flex align-items-center gap-2">
            <img src={avatar} alt="avatar" width="36" height="36" className="rounded-circle border" />
            <span className="fw-semibold small">{username}</span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default AppNavbar;
