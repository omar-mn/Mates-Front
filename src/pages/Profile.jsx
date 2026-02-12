import { useEffect, useMemo, useState } from 'react';
import { listRooms } from '../api/rooms';
import Avatar from '../components/Avatar';
import { ProfileSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingRooms(true);
        const data = await listRooms(1);
        setRooms(Array.isArray(data) ? data : data.results ?? []);
      } finally {
        setLoadingRooms(false);
      }
    };

    void run();
  }, []);

  const myRooms = useMemo(() => {
    if (!user) return [];
    return rooms.filter((room) => room.owner.username === user.username);
  }, [rooms, user]);

  if (!user) {
    return <div className="mx-auto max-w-6xl p-4">Unable to load profile.</div>;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar src={user.profileImage} alt={user.username} fallbackText={user.username} className="h-20 w-20 text-lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.username}</h1>
            <p className="text-slate-600">{user.email}</p>
            <p className="mt-2 text-sm text-slate-500">
              First name: {user.first_name ?? '—'} | Last name: {user.last_name ?? '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">My Rooms</h2>
        {loadingRooms ? (
          <ProfileSkeleton />
        ) : myRooms.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {myRooms.map((room) => (
              <article key={`${room.owner.username}-${room.name}`} className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800">{room.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{room.category}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">You don't own any rooms yet.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Joined Rooms</h2>
        <p className="text-sm text-slate-600">No joined rooms yet — coming soon.</p>
      </section>
    </main>
  );
};

export default Profile;
