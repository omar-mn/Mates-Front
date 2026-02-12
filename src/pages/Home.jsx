import { useEffect, useMemo, useState } from 'react';
import { createRoom, getRooms } from '../api';

const ROOMS_PER_PAGE = 10;

function Home({ selectedCategory, createRoomRequest, refreshRoomsRequest, onApiStatusChange, showToast }) {
  const token = localStorage.getItem('accessToken');
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [isServerPagination, setIsServerPagination] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  const [newRoom, setNewRoom] = useState({ name: '', category: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const totalClientPages = Math.max(1, Math.ceil(allRooms.length / ROOMS_PER_PAGE));

  const parsePageFromUrl = (url) => {
    if (!url) return null;
    try {
      return Number(new window.URL(url).searchParams.get('page')) || null;
    } catch {
      return null;
    }
  };

  const loadRooms = async (pageOrUrl = 1, direction = null) => {
    setError('');
    setLoading(true);

    try {
      const data = await getRooms(token, pageOrUrl);

      // Response-shape detection for robust pagination:
      // 1) DRF pagination object => use data.rooms + data.next/data.previous from backend.
      // 2) Plain array => switch to local client-side pagination with slice(...).
      if (data.isPaginated) {
        setIsServerPagination(true);
        setRooms(data.rooms || []);
        setNextUrl(data.next);
        setPrevUrl(data.previous);

        if (typeof pageOrUrl === 'number') {
          setCurrentPage(pageOrUrl);
        } else if (direction === 'next') {
          setCurrentPage((prev) => prev + 1);
        } else if (direction === 'prev') {
          setCurrentPage((prev) => Math.max(1, prev - 1));
        } else {
          setCurrentPage(parsePageFromUrl(pageOrUrl) || 1);
        }
      } else {
        setIsServerPagination(false);
        const fullList = data.rooms || [];
        const requestedPage = typeof pageOrUrl === 'number' ? pageOrUrl : 1;
        const safePage = Math.min(Math.max(1, requestedPage), Math.max(1, Math.ceil(fullList.length / ROOMS_PER_PAGE)));
        setAllRooms(fullList);
        setCurrentPage(safePage);
        setRooms(fullList.slice((safePage - 1) * ROOMS_PER_PAGE, safePage * ROOMS_PER_PAGE));
        setNextUrl(null);
        setPrevUrl(null);
      }

      onApiStatusChange('connected');
    } catch (err) {
      setError(err.message);
      onApiStatusChange('error');
      showToast?.(err.message || 'Failed to load rooms', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadClientPage = (targetPage) => {
    const safePage = Math.min(Math.max(1, targetPage), totalClientPages);
    setCurrentPage(safePage);
    setRooms(allRooms.slice((safePage - 1) * ROOMS_PER_PAGE, safePage * ROOMS_PER_PAGE));
  };

  useEffect(() => {
    loadRooms(1);
  }, []);

  useEffect(() => {
    if (refreshRoomsRequest > 0) {
      if (isServerPagination) {
        loadRooms(currentPage);
      } else {
        loadRooms(1);
      }
    }
  }, [refreshRoomsRequest]);

  useEffect(() => {
    if (!isServerPagination && allRooms.length) {
      loadClientPage(currentPage);
    }
  }, [allRooms, currentPage, isServerPagination]);

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
      showToast?.('Room created successfully.', 'success');
      if (isServerPagination) {
        loadRooms(currentPage);
      } else {
        loadRooms(1);
      }
    } catch (err) {
      setCreateError(err.message);
      onApiStatusChange('error');
      showToast?.(err.message || 'Failed to create room', 'danger');
    } finally {
      setCreating(false);
    }
  };

  const fakeCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://mates-room-link.example/coming-soon');
      showToast?.('Room link copied (fake link for now).', 'success');
    } catch {
      showToast?.('Could not copy room link.', 'danger');
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
          <button className="btn btn-sm btn-outline-light" onClick={() => loadRooms(isServerPagination ? currentPage : 1)}>Retry</button>
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
              <div className="card room-card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <h5 className="room-title mb-0">{room.name || 'Untitled Room'}</h5>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light border rounded-circle" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical" /></button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" onClick={() => setRoomInfo(room)} data-bs-toggle="modal" data-bs-target="#roomInfoModal">
                            Room info
                          </button>
                        </li>
                        <li><button className="dropdown-item" onClick={fakeCopyLink}>Copy link</button></li>
                        <li><button className="dropdown-item" onClick={() => showToast?.('More options coming soon!', 'info')}>Coming soon options</button></li>
                      </ul>
                    </div>
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
                    <small className="text-secondary">Active room</small>
                  </div>

                  <p className={`room-desc text-secondary flex-grow-1 mb-0 ${hasArabicText(room.description) ? 'rtl-text' : ''}`}>
                    {room.description || 'No description yet.'}
                  </p>

                  <div className="room-footer">
                    <button className="btn btn-outline-primary rounded-3 px-4" onClick={() => showToast?.('Join feature: Coming soon', 'info')}>
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

      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${isServerPagination ? (!prevUrl ? 'disabled' : '') : (currentPage <= 1 ? 'disabled' : '')}`}>
            <button
              className="page-link"
              onClick={() => {
                if (isServerPagination) {
                  if (prevUrl) loadRooms(prevUrl, 'prev');
                } else if (currentPage > 1) {
                  loadClientPage(currentPage - 1);
                }
              }}
            >
              Previous
            </button>
          </li>
          <li className="page-item active"><span className="page-link">{currentPage}</span></li>
          {!isServerPagination && <li className="page-item"><span className="page-link">/ {totalClientPages}</span></li>}
          <li className={`page-item ${isServerPagination ? (!nextUrl ? 'disabled' : '') : (currentPage >= totalClientPages ? 'disabled' : '')}`}>
            <button
              className="page-link"
              onClick={() => {
                if (isServerPagination) {
                  if (nextUrl) loadRooms(nextUrl, 'next');
                } else if (currentPage < totalClientPages) {
                  loadClientPage(currentPage + 1);
                }
              }}
            >
              Next
            </button>
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

      <div className="modal fade room-info-modal" id="roomInfoModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-0">Room Info</h5>
                <small className="text-secondary">{roomInfo?.name || 'Selected room details'}</small>
              </div>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body d-grid gap-3">
              <div className="info-card">
                <div className="row g-3 align-items-center">
                  <div className="col-md-8">
                    <div className="info-section">
                      <p className="info-label mb-1"><i className="bi bi-chat-dots me-2" />Name</p>
                      <p className="info-value mb-0">{roomInfo?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="info-section">
                      <p className="info-label mb-1"><i className="bi bi-tag me-2" />Category</p>
                      <span className="room-category-pill">{roomInfo?.category || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-section">
                  <p className="info-label mb-2"><i className="bi bi-person me-2" />Owner</p>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={roomInfo?.owner?.profileImage || 'https://via.placeholder.com/40x40.png?text=U'}
                      alt="owner"
                      width="40"
                      height="40"
                      className="rounded-circle border"
                    />
                    <p className="info-value mb-0">{roomInfo?.owner?.username || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-section">
                  <p className="info-label mb-2"><i className="bi bi-card-text me-2" />Description</p>
                  <p className="info-value mb-0">{roomInfo?.description || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
