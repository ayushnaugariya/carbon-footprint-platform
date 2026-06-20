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
    <div className="mx-auto max-w-md py-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center gap-3 mb-2 select-none">
        <svg 
          className="h-12 w-12 text-brand-600 animate-float" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.2a7.07 7.07 0 0 1-6 6.8V22" />
          <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
        </svg>
        <h1 className="text-center text-3xl font-black tracking-tight text-brand-900">
          Green<span className="text-brand-600">Track</span>
        </h1>
        <p className="text-center text-xs font-semibold text-ink-500 uppercase tracking-widest -mt-1">
          Carbon Footprint Platform
        </p>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6 border border-slate-200/50 shadow-xl shadow-slate-100/50">
        {/* Toggle Mode Tabs */}
        <div role="tablist" aria-label="Authentication mode" className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              mode === 'login' 
                ? 'bg-white text-brand-800 shadow-sm' 
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              mode === 'signup' 
                ? 'bg-white text-brand-800 shadow-sm' 
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Auth Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayName" className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white/60 px-3.5 py-2.5 text-sm transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold text-ink-700 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white/60 px-3.5 py-2.5 text-sm transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-ink-700 uppercase tracking-wider">
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
              className="rounded-lg border border-slate-200 bg-white/60 px-3.5 py-2.5 text-sm transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            {mode === 'signup' ? (
              <p className="text-[10px] text-ink-500 leading-normal">
                Must be at least 8 characters.
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700 font-semibold border border-rose-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-700 px-4 py-3 font-bold text-white shadow-md shadow-brand-100 hover:bg-brand-800 transition-colors duration-200 disabled:opacity-60 text-sm mt-2"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Guest Session Access */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 font-bold text-ink-700 transition-colors duration-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50 disabled:opacity-60 text-sm"
        >
          Continue as guest
        </button>
        <p className="mt-3 text-center text-[10px] text-ink-500 leading-normal">
          Guest sessions let you try the platform instantly. Sign up later to keep your history permanently.
        </p>
      </div>
    </div>
  );
}
