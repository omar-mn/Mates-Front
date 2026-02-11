import type { Room } from '../api/rooms';
import Avatar from './Avatar';

type RoomInfoModalProps = {
  room: Room | null;
  onClose: () => void;
};

const RoomInfoModal = ({ room, onClose }: RoomInfoModalProps) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{room.name}</h3>
            <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {room.category}
            </span>
          </div>
          <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-600" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Avatar src={room.owner.profileImage} alt={room.owner.username} fallbackText={room.owner.username} />
          <div>
            <p className="text-sm text-slate-500">Owned by</p>
            <p className="font-medium text-slate-800">{room.owner.username}</p>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{room.description || 'No description provided.'}</p>
      </div>
    </div>
  );
};

export default RoomInfoModal;
