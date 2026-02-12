import Avatar from './Avatar';

const RoomCard = ({ room, onInfo }) => {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
          <p className="text-sm capitalize text-slate-500">{room.category}</p>
        </div>
        <button onClick={() => onInfo(room)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
          Info
        </button>
      </div>

      <p className="line-clamp-3 min-h-16 text-sm text-slate-600">{room.description || 'No description provided.'}</p>

      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
        <Avatar src={room.owner.profileImage} alt={room.owner.username} fallbackText={room.owner.username} className="h-9 w-9" />
        <div>
          <p className="text-sm font-medium text-slate-800">{room.owner.username}</p>
          <p className="text-xs text-slate-500">Room owner</p>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
