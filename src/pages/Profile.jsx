import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, getRooms, resolveMediaUrl, updateCurrentUser } from '../api';

const getFallbackAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff`;
};

function Profile({ currentUser, setCurrentUser, showToast }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
  });

  const fullName = useMemo(() => {
    const fromApi = profile?.full_name && profile.full_name !== 'None None' ? profile.full_name : '';
    const local = `${form.first_name || ''} ${form.last_name || ''}`.trim();
    return fromApi || local || profile?.username || 'Profile';
  }, [form.first_name, form.last_name, profile]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = await getCurrentUser();
      setProfile(userData);
      setCurrentUser?.(userData);
      setForm((prev) => ({
        ...prev,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        bio: userData.bio || '',
      }));

      const rooms = await getRooms();
      setMyRooms((rooms || []).filter((room) => room.owner?.username === userData.username));
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
      };

      const updated = await updateCurrentUser(payload);
      setProfile(updated);
      setCurrentUser?.(updated);
      showToast?.('Profile updated successfully.', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      showToast?.(err.message || 'Failed to update profile', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center"><div className="spinner-border" /></div>;
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <img
          src={resolveMediaUrl(profile?.profile_banner, getFallbackAvatar(profile?.username))}
          onError={(e) => { e.currentTarget.src = getFallbackAvatar(profile?.username); }}
          alt="profile banner"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="p-4 d-flex flex-wrap align-items-center gap-3">
          <img
            src={resolveMediaUrl(profile?.profileImage, getFallbackAvatar(profile?.username))}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackAvatar(profile?.username); }}
            alt="profile"
            width="88"
            height="88"
            className="rounded-circle border"
          />
          <div>
            <h4 className="mb-1">{fullName}</h4>
            <div className="text-secondary">@{profile?.username || 'user'}</div>
            <div className="text-secondary">{profile?.email || 'No email available'}</div>
            <p className="mb-0 mt-2 text-secondary">{profile?.bio || form.bio || 'No bio added yet.'}</p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={handleSubmit}>
            <h5 className="mb-3">Edit profile</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">First name</label>
                <input className="form-control" value={form.first_name} onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Last name</label>
                <input className="form-control" value={form.last_name} onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows="3" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="mb-3">My Rooms</h5>
            {myRooms.length ? (
              <ul className="list-group list-group-flush">
                {myRooms.map((room) => (
                  <li key={room.id} className="list-group-item px-0">
                    <div className="fw-semibold">{room.name}</div>
                    <small className="text-secondary">{room.category || 'General'}</small>
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-info mb-0">No rooms created yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
