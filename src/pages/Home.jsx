import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getRooms, joinRoom } from '../api';

function Home({ selectedCategory, createRoomRequest, refreshRoomsRequest, onApiStatusChange, showToast }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [newRoom, setNewRoom] = useState({ name: '', category: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadRooms = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await getRooms();
      setRooms(data || []);
      onApiStatusChange('connected');
    } catch (err) {
      setError(err.message);
      onApiStatusChange('error');
      showToast?.(err.message || 'Failed to load rooms', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (refreshRoomsRequest > 0) loadRooms();
  }, [refreshRoomsRequest]);

  useEffect(() => {
    if (createRoomRequest > 0) {
      const modalEl = document.getElementById('createRoomModal');
      if (modalEl && window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    }
  }, [createRoomRequest]);

  const filteredRooms = useMemo(() => {
    const text = search.toLowerCase();
    return rooms.filter((room) => {
      const name = (room.name || '').toLowerCase();
      const category = (room.category || '').toLowerCase();
      const description = (room.description || '').toLowerCase();
      const matchesSearch = name.includes(text) || category.includes(text) || description.includes(text);
      const matchesCategory = selectedCategory ? category === selectedCategory.toLowerCase() : true;
      return matchesSearch && matchesCategory;
    });
  }, [rooms, search, selectedCategory]);

  const submitCreateRoom = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      await createRoom(newRoom);
      setNewRoom({ name: '', category: '', description: '' });
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('createRoomModal')).hide();
      showToast?.('Room created successfully.', 'success');
      loadRooms();
    } catch (err) {
      setCreateError(err.message);
      onApiStatusChange('error');
      showToast?.(err.message || 'Failed to create room', 'danger');
    } finally {
      setCreating(false);
    }
  };

  const submitJoinRoom = async (e, roomId) => {
    e.stopPropagation();
    try {
      await joinRoom(roomId);
      showToast?.('Joined room', 'success');
      loadRooms();
    } catch (err) {
      showToast?.(err.message || 'Failed to join room', 'danger');
    }
  };

  const hasArabicText = (value = '') => /[\u0600-\u06FF]/.test(value);

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Rooms</h2>
          {selectedCategory && <small className="text-secondary">Filtering by: {selectedCategory}</small>}
        </div>
        <button className="btn btn-primary rounded-3" data-bs-toggle="modal" data-bs-target="#createRoomModal">
          Create Room
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <input
          className="form-control"
          placeholder="Search rooms by name/category/description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-light" onClick={loadRooms}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" />
        </div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => (
            <div key={room.id} className="col-12 col-lg-6">
              <div
                className="card room-card h-100 border-0 shadow-sm rounded-4"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/room/${room.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/room/${room.id}`);
                }}
              >
                <div className="card-body d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <h5 className="room-title mb-0">{room.name || 'Untitled Room'}</h5>
                  </div>

                  <div className="room-owner-row d-flex align-items-center gap-2">
                    <img
                      src={room.owner?.profileImage || 'https://via.placeholder.com/32x32.png?text=U'}
                      alt="owner"
                      width="32"
                      height="32"
                      className="rounded-circle border"
                    />
                    <small className="fw-semibold">{room.owner?.username || 'Unknown owner'}</small>
                  </div>

                  <div className="room-meta d-flex align-items-center gap-2">
                    <span className="room-category-pill">{room.category || 'General'}</span>
                    <span className="room-meta-dot" aria-hidden="true">•</span>
                    <small className="text-secondary">Open room</small>
                  </div>

                  <p className={`room-desc text-secondary flex-grow-1 mb-0 ${hasArabicText(room.description) ? 'rtl-text' : ''}`}>
                    {room.description || 'No description yet.'}
                  </p>

                  <div className="room-footer">
                    <button className="btn btn-outline-primary rounded-3 px-4" onClick={(e) => submitJoinRoom(e, room.id)}>
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!filteredRooms.length && (
            <div className="col-12">
              <div className="alert alert-info mb-0">No rooms found.</div>
            </div>
          )}
        </div>
      )}

      <div className="modal fade" id="createRoomModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">Create a room</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={submitCreateRoom}>
              <div className="modal-body d-grid gap-3">
                {createError && <div className="alert alert-danger mb-0">{createError}</div>}
                <input className="form-control" placeholder="Room name" required value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                <input className="form-control" placeholder="Category" required value={newRoom.category} onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })} />
                <textarea className="form-control" placeholder="Description" rows="3" required value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
