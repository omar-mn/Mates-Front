import { NavLink } from 'react-router-dom';

const categories = ['games', 'tech', 'music', 'general', 'sports'];

function SidebarContent({
  onCreateRoom,
  onRefreshRooms,
  apiStatus,
  selectedCategory,
  onCategorySelect,
  onLogout,
}) {
  return (
    <>
      <div className="sidebar-section">
        <h6 className="sidebar-heading">Navigation</h6>
        <nav className="nav flex-column gap-1">
          <NavLink to="/home" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-house" /> Home (Rooms)</NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-person" /> Profile</NavLink>
          <NavLink to="/updates" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-megaphone" /> Updates</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-gear" /> Settings</NavLink>
          <NavLink to="/help" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-question-circle" /> Help</NavLink>
          <NavLink to="/about" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><i className="bi bi-info-circle" /> About</NavLink>
        </nav>
      </div>

      <div className="sidebar-section">
        <h6 className="sidebar-heading">Quick Actions</h6>
        <div className="d-grid gap-2">
          <button className="btn btn-primary btn-sm" onClick={onCreateRoom}><i className="bi bi-plus-circle" /> Create Room</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={onRefreshRooms}><i className="bi bi-arrow-clockwise" /> Refresh Rooms</button>
        </div>
      </div>

      <div className="sidebar-section">
        <h6 className="sidebar-heading">Categories</h6>
        <div className="d-flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </button>
          ))}
          <button className="btn btn-sm btn-link text-decoration-none px-1" onClick={() => onCategorySelect('')}>Clear</button>
        </div>
      </div>

      <div className="sidebar-section">
        <h6 className="sidebar-heading">Account</h6>
        <button className="sidebar-link sidebar-button" onClick={onLogout}><i className="bi bi-box-arrow-right" /> Logout</button>
      </div>

      <div className="mt-auto sidebar-footer small">
        <div>Version: v0.1</div>
        <span className={`badge ${apiStatus === 'error' ? 'text-bg-danger' : 'text-bg-success'}`}>
          API: {apiStatus === 'error' ? 'Error' : 'Connected'}
        </span>
      </div>
    </>
  );
}

function AppSidebar(props) {
  return (
    <>
      <aside className="app-sidebar d-none d-lg-flex">
        <div className="app-sidebar-inner">
          <SidebarContent {...props} />
        </div>
      </aside>

      <div className="offcanvas offcanvas-start app-sidebar-offcanvas" tabIndex="-1" id="appSidebarOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Mates Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <SidebarContent {...props} />
        </div>
      </div>
    </>
  );
}

export default AppSidebar;
