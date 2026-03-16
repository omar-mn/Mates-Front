import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, deleteRoom, getRooms, toggleRoomMembership, updateRoom } from '../api';

const ROOM_CATEGORIES = ['study', 'games', 'programing', 'life issues', 'other'];

const getFallbackAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff`;
};

function Home({ currentUser, selectedCategory, createRoomRequest, refreshRoomsRequest, onApiStatusChange, showToast }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingRoomId, setTogglingRoomId] = useState(null);

  const [newRoom, setNewRoom] = useState({ name: '', category: ROOM_CATEGORIES[0], description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  

  const currentUsername = currentUser?.username || '';

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

    if (!newRoom.name.trim() || !newRoom.category) {
      setCreateError('Room name and category are required.');
      return;
    }

    setCreating(true);

    try {
      await createRoom({
        name: newRoom.name.trim(),
        description: newRoom.description.trim(),
        category: newRoom.category,
      });
      setNewRoom({ name: '', category: ROOM_CATEGORIES[0], description: '' });
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

  const submitJoinLeave = async (e, room) => {
    e.stopPropagation();
    setTogglingRoomId(room.id);

    try {
      const wasMember = Boolean(room.is_member);
      await toggleRoomMembership(room.id);
      setRooms((prev) => prev.map((item) => (item.id === room.id ? { ...item, is_member: !wasMember } : item)));
      showToast?.(wasMember ? 'Left room' : 'Joined room', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update room membership', 'danger');
    } finally {
      setTogglingRoomId(null);
    }
  };

  const submitEditRoom = async (e) => {
    e.preventDefault();
    if (!editingRoom?.name?.trim()) {
      showToast?.('Room name is required.', 'danger');
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await updateRoom(editingRoom.id, {
        name: editingRoom.name.trim(),
        description: editingRoom.description || '',
        category: editingRoom.category,
      });

      setRooms((prev) => prev.map((room) => (room.id === editingRoom.id ? { ...room, ...updated } : room)));
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editRoomModal')).hide();
      showToast?.('Room updated successfully.', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update room', 'danger');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return;

    try {
      await deleteRoom(deletingRoom.id);
      setRooms((prev) => prev.filter((room) => room.id !== deletingRoom.id));
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteRoomModal')).hide();
      showToast?.('Room deleted successfully.', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete room', 'danger');
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Rooms</h2>
          {selectedCategory && <small className="text-secondary">Filtering by: {selectedCategory}</small>}
        </div>
        <button className="btn btn-primary rounded-3" data-bs-toggle="modal" data-bs-target="#createRoomModal">Create Room</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <input className="form-control" placeholder="Search rooms by name/category/description" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-light" onClick={loadRooms}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => {
            const isOwner = currentUsername && room.owner?.username === currentUsername;

            return (
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
                      <button className="btn btn-link text-start p-0 text-decoration-none room-title" onClick={(e) => { e.stopPropagation(); navigate(`/room/${room.id}`); }}>
                        {room.name || 'Untitled Room'}
                      </button>

                      {isOwner && (
                        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                            <i className="bi bi-three-dots" />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><button className="dropdown-item" onClick={() => {
                              setEditingRoom({
                                id: room.id,
                                name: room.name || '',
                                description: room.description || '',
                                category: room.category || ROOM_CATEGORIES[0],
                              });
                              window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editRoomModal')).show();
                            }}>Edit room</button></li>
                            <li><button className="dropdown-item text-danger" onClick={() => {
                              setDeletingRoom(room);
                              window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteRoomModal')).show();
                            }}>Delete room</button></li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="room-owner-row d-flex align-items-center gap-2">
                      <img
                        src={room.owner?.profileImage || getFallbackAvatar(room.owner?.username)}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackAvatar(room.owner?.username); }}
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

                    <p className="room-desc text-secondary flex-grow-1 mb-0">{room.description || 'No description yet.'}</p>

                    <div className="room-footer gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); navigate(`/room/${room.id}`); }}>Open Room</button>
                      <button className="btn btn-outline-primary rounded-3 px-4" onClick={(e) => submitJoinLeave(e, room)} disabled={togglingRoomId === room.id}>
                        {togglingRoomId === room.id ? '...' : (room.is_member ? 'Leave' : 'Join')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!filteredRooms.length && <div className="col-12"><div className="alert alert-info mb-0">No rooms found.</div></div>}
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
                <select className="form-select" value={newRoom.category} onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })} required>
                  {ROOM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <textarea className="form-control" placeholder="Description" rows="3" value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="editRoomModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">Edit room</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={submitEditRoom}>
              <div className="modal-body d-grid gap-3">
                <input className="form-control" placeholder="Room name" required value={editingRoom?.name || ''} onChange={(e) => setEditingRoom((prev) => ({ ...prev, name: e.target.value }))} />
                <select className="form-select" value={editingRoom?.category || ROOM_CATEGORIES[0]} onChange={(e) => setEditingRoom((prev) => ({ ...prev, category: e.target.value }))}>
                  {ROOM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <textarea className="form-control" rows="3" value={editingRoom?.description || ''} onChange={(e) => setEditingRoom((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button className="btn btn-primary" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="deleteRoomModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">Delete room</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{deletingRoom?.name || 'this room'}</strong>? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteRoom}>Delete room</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
