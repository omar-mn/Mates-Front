import { useEffect, useState } from 'react';
import { getProfile, getRooms } from '../api';

function Profile() {
  const token = localStorage.getItem('accessToken');
  const [profile, setProfile] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const profileData = await getProfile(token);
        const userData = profileData.userData || {};
        setProfile(userData);

        const roomsData = await getRooms(token, 1);
        const mine = (roomsData.rooms || []).filter((room) => room.owner?.username === userData.username);
        setMyRooms(mine);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={profile?.profileImage || 'https://via.placeholder.com/80x80.png?text=User'}
            alt="profile"
            width="80"
            height="80"
            className="rounded-circle border"
          />
          <div>
            <h4 className="mb-1">{profile?.username || 'No username'}</h4>
            <p className="mb-1 text-secondary">{profile?.email}</p>
            <span className="badge text-bg-primary">Profile</span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
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
            ) : (
              <div className="alert alert-info mb-0">No rooms created yet.</div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="mb-3">Joined Rooms</h5>
            <div className="alert alert-warning mb-0">Coming soon.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
