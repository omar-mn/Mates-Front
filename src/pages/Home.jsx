import { useEffect, useMemo, useState } from 'react';
import { createRoom, getRooms } from '../api';

function Home({ selectedCategory, createRoomRequest, refreshRoomsRequest, onApiStatusChange }) {
  const token = localStorage.getItem('accessToken');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  const [newRoom, setNewRoom] = useState({ name: '', category: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadRooms = async (pageNumber) => {
    setError('');
    setLoading(true);

    try {
      const data = await getRooms(token, pageNumber);
      setRooms(data.rooms || []);
      setHasNext(Boolean(data.next));
      setHasPrev(Boolean(data.previous));
      setPage(pageNumber);
      onApiStatusChange('connected');
    } catch (err) {
      setError(err.message);
      onApiStatusChange('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1);
  }, []);

  useEffect(() => {
    if (refreshRoomsRequest > 0) {
      loadRooms(page);
    }
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
      await createRoom(token, newRoom);
      setNewRoom({ name: '', category: '', description: '' });
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('createRoomModal')).hide();
      loadRooms(page);
    } catch (err) {
      setCreateError(err.message);
      onApiStatusChange('error');
    } finally {
      setCreating(false);
    }
  };

  const fakeCopyLink = () => {
    navigator.clipboard.writeText('https://mates-room-link.example/coming-soon');
    alert('Room link copied (fake link for now).');
  };

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

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" />
        </div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => (
            <div key={room.id} className="col-12 col-lg-6">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={room.owner?.profileImage || 'https://via.placeholder.com/32x32.png?text=U'}
                        alt="owner"
                        width="32"
                        height="32"
                        className="rounded-circle border"
                      />
                      <small className="fw-semibold">{room.owner?.username || 'Unknown owner'}</small>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light border rounded-circle" data-bs-toggle="dropdown">⋮</button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" onClick={() => setRoomInfo(room)} data-bs-toggle="modal" data-bs-target="#roomInfoModal">
                            Room info
                          </button>
                        </li>
                        <li><button className="dropdown-item" onClick={fakeCopyLink}>Copy link</button></li>
                        <li><button className="dropdown-item" onClick={() => alert('More options coming soon!')}>Coming soon options</button></li>
                      </ul>
                    </div>
                  </div>

                  <h5 className="card-title mb-0">{room.name || 'Untitled Room'}</h5>
                  <span className="badge text-bg-secondary d-inline-block">{room.category || 'General'}</span>
                  <p className="text-secondary flex-grow-1 mb-2">{(room.description || 'No description yet.').slice(0, 120)}{room.description?.length > 120 ? '...' : ''}</p>
                  <button className="btn btn-outline-primary rounded-3" onClick={() => alert('Join feature: Coming soon')}>
                    Join
                  </button>
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

      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => hasPrev && loadRooms(page - 1)}>Previous</button>
          </li>
          <li className="page-item active"><span className="page-link">{page}</span></li>
          <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => hasNext && loadRooms(page + 1)}>Next</button>
          </li>
        </ul>
      </nav>

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

      <div className="modal fade" id="roomInfoModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">Room Info</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <h5>{roomInfo?.name || '-'}</h5>
              <p className="mb-2"><strong>Owner:</strong> {roomInfo?.owner?.username || '-'}</p>
              <p className="mb-2"><strong>Category:</strong> {roomInfo?.category || '-'}</p>
              <p className="mb-0"><strong>Description:</strong> {roomInfo?.description || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
