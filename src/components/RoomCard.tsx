import { useMemo, useState } from 'react';
import type { Room } from '../api/rooms';
import Avatar from './Avatar';
import { useToast } from './ToastProvider';
import { cn } from '../utils/helpers';

type RoomCardProps = {
  room: Room;
  onInfo: (room: Room) => void;
};

const RoomCard = ({ room, onInfo }: RoomCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const { pushToast } = useToast();

  const roomUrl = useMemo(() => `/rooms/${encodeURIComponent(room.name)}`, [room.name]);

  const toggleJoin = () => {
    setJoined((current) => !current);
    pushToast(joined ? 'Left room (UI only)' : 'Joined room (UI only)', 'info');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      pushToast('Room link copied', 'success');
    } catch {
      pushToast('Unable to copy in this browser', 'error');
    }
  };

  return (
    <article className="relative rounded-2xl bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
          <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">{room.category}</span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
              <button onClick={() => onInfo(room)} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
                Room Info
              </button>
              <button onClick={copyLink} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
                Copy Link
              </button>
              <button onClick={toggleJoin} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100">
                {joined ? 'Leave' : 'Join'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Avatar src={room.owner.profileImage} alt={room.owner.username} fallbackText={room.owner.username} className="h-8 w-8" />
        <span className="text-sm text-slate-600">{room.owner.username}</span>
      </div>

      <p className="line-clamp-2 min-h-10 text-sm text-slate-600">{room.description || 'No description provided yet.'}</p>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onInfo(room)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
          View
        </button>
        <button
          onClick={toggleJoin}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white', joined ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700')}
        >
          {joined ? 'Joined' : 'Join'}
        </button>
      </div>
    </article>
  );
};

export default RoomCard;
