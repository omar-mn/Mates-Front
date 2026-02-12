import { useEffect, useMemo, useState } from 'react';
import { listRooms } from '../api/rooms';
import CreateRoomModal from '../components/CreateRoomModal';
import Pagination from '../components/Pagination';
import RoomCard from '../components/RoomCard';
import RoomInfoModal from '../components/RoomInfoModal';
import { RoomCardSkeleton } from '../components/Skeletons';
import { useToast } from '../components/ToastProvider';
import { normalizeRoomsResponse } from '../utils/pagination';
import { toFriendlyError } from '../utils/helpers';

const emptyPage = {
  rooms: [],
  currentPage: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  mode: 'client',
};

const Home = () => {
  const [roomsPage, setRoomsPage] = useState(emptyPage);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { pushToast } = useToast();

  const loadRooms = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError(null);
      // Rooms API may send plain array or paginated object, normalize handles both.
      const data = await listRooms(requestedPage);
      const normalized = normalizeRoomsResponse(data, requestedPage);
      setRoomsPage(normalized);
      setPage(normalized.currentPage);
    } catch (err) {
      setError(toFriendlyError(err, 'Unable to fetch rooms right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return roomsPage.rooms;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return roomsPage.rooms.filter((room) =>
      [room.name, room.category, room.owner.username].some((entry) => entry?.toLowerCase().includes(normalizedSearch)),
    );
  }, [roomsPage.rooms, searchTerm]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <section className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by room, category, owner..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:max-w-sm"
        />
        <button onClick={() => setCreateOpen(true)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Create Room
        </button>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p>{error}</p>
          <button onClick={() => void loadRooms(page)} className="mt-2 rounded bg-rose-600 px-3 py-1.5 font-medium text-white">
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={`${room.owner.username}-${room.name}`} room={room} onInfo={setSelectedRoom} />
            ))}
          </div>

          {!filteredRooms.length && <p className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-soft">No rooms match your search.</p>}

          <Pagination
            currentPage={roomsPage.currentPage}
            totalPages={roomsPage.totalPages}
            hasNext={roomsPage.hasNext}
            hasPrevious={roomsPage.hasPrevious}
            onNext={() => void loadRooms(roomsPage.currentPage + 1)}
            onPrevious={() => void loadRooms(roomsPage.currentPage - 1)}
          />

          <p className="mt-2 text-right text-xs text-slate-500">Pagination mode: {roomsPage.mode === 'server' ? 'Server-driven' : 'Client-side fallback'}</p>
        </>
      )}

      <CreateRoomModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          // After create, refresh first page so new room appears immediately.
          await loadRooms(1);
          pushToast('Rooms refreshed', 'info');
        }}
      />
      <RoomInfoModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </main>
  );
};

export default Home;
