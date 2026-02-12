const upcoming = [
  'Join flow with persistent memberships',
  'Role-based room moderation and permissions',
  'Room settings and rich customization',
  'Realtime chat messages + typing indicators',
  'Notifications center and unread badges',
  'Invite links and shareable room access',
];

const Updates = () => (
  <main className="mx-auto w-full max-w-5xl px-4 py-6">
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-900">Upcoming Updates</h1>
      <p className="mt-2 text-slate-600">We are shipping room experiences in waves. Here's what's next:</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {upcoming.map((item) => (
          <article key={item} className="rounded-xl border border-slate-200 p-4">
            <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Planned</span>
            <p className="text-sm text-slate-700">{item}</p>
          </article>
        ))}
      </div>
    </section>
  </main>
);

export default Updates;
