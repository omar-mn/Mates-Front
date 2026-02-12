import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useToast } from '../components/ToastProvider';
import { toFriendlyError } from '../utils/helpers';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await registerUser({ email, password });
      pushToast('Registration successful. Please sign in.', 'success');
      navigate('/login');
    } catch (error) {
      pushToast(toFriendlyError(error, 'Could not register user'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-4">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="mb-6 text-2xl font-bold">Create account</h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-700">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
