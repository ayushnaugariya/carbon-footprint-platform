import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { user, login, signup, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setIsSubmitting(true);
    try {
      await continueAsGuest();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start a guest session');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-center text-3xl font-bold text-brand-900">🌍 GreenTrack</h1>
      <p className="mt-2 text-center text-ink-700">Understand, track, and reduce your carbon footprint.</p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <div role="tablist" aria-label="Authentication mode" className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-brand-800 shadow' : 'text-ink-500'}`}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-brand-800 shadow' : 'text-ink-500'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' ? (
            <div className="flex flex-col gap-1">
              <label htmlFor="displayName" className="text-sm font-medium text-ink-700">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-ink-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-ink-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={mode === 'signup' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            {mode === 'signup' ? <p className="text-xs text-ink-500">At least 8 characters.</p> : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase text-ink-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-ink-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          Continue as guest
        </button>
        <p className="mt-2 text-center text-xs text-ink-500">
          Guest sessions let you try the platform instantly. Sign up later to keep your history permanently.
        </p>
      </div>
    </div>
  );
}
