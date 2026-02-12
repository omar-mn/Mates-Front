function Settings({ onLogout }) {
  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
        <h2 className="mb-3">Account Settings</h2>
        <p className="text-secondary mb-3">Manage your account session here.</p>
        <button className="btn btn-danger" onClick={onLogout}>
          <i className="bi bi-box-arrow-right me-2" />
          Logout
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
        <h5 className="mb-2">Notifications</h5>
        <p className="mb-0 text-secondary">Coming soon.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="mb-2">Privacy</h5>
        <p className="mb-0 text-secondary">Coming soon.</p>
      </div>
    </div>
  );
}

export default Settings;
