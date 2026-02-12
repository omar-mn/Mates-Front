const RoomInfoModal = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft">
        <h3 className="text-xl font-semibold text-slate-900">{room.name}</h3>
        <p className="mt-2 text-sm capitalize text-slate-500">Category: {room.category}</p>

        <p className="mt-4 text-sm text-slate-700">{room.description || 'No description added for this room.'}</p>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p>
            Owner: <span className="font-semibold text-slate-800">{room.owner.username}</span>
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Close
          </button>
        </div>
      </section>
    </div>
  );
};

export default RoomInfoModal;
