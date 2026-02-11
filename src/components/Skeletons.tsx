export const RoomCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-4 shadow-soft">
    <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />
    <div className="mb-4 h-4 w-1/3 rounded bg-slate-200" />
    <div className="mb-5 h-12 rounded bg-slate-200" />
    <div className="h-9 w-full rounded bg-slate-200" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-6 shadow-soft">
    <div className="mb-4 h-20 w-20 rounded-full bg-slate-200" />
    <div className="mb-3 h-5 w-40 rounded bg-slate-200" />
    <div className="h-4 w-64 rounded bg-slate-200" />
  </div>
);
