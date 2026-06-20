import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function HomePage() {
  const { user, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestClick() {
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
    <div className="flex flex-col gap-16 py-4 md:py-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider animate-float shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Understand. Track. Reduce.
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-ink-900 tracking-tight max-w-3xl leading-tight">
          Small steps, big impact. <br />
          <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
            Track your carbon footprint.
          </span>
        </h1>

        <p className="text-base md:text-lg text-ink-700 max-w-2xl leading-relaxed">
          Your personal carbon footprint measures the total greenhouse gas emissions caused by your direct actions. 
          Discover your impact, set reduction goals, and unlock customized habits to live more sustainably.
        </p>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-4 py-2.5 text-xs text-rose-700 font-semibold border border-rose-100 max-w-md">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-brand-700 px-6 py-3.5 font-bold text-white shadow-md shadow-brand-100 hover:bg-brand-800 hover:scale-[1.02] transition-all text-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGuestClick}
                disabled={isSubmitting}
                className="rounded-xl bg-brand-700 px-6 py-3.5 font-bold text-white shadow-md shadow-brand-100 hover:bg-brand-800 hover:scale-[1.02] transition-all text-sm disabled:opacity-60"
              >
                {isSubmitting ? 'Starting Session...' : 'Try instantly as Guest'}
              </button>
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 font-bold text-ink-700 hover:bg-slate-50 hover:border-brand-300 hover:text-brand-700 hover:scale-[1.02] transition-all text-sm shadow-sm"
              >
                Sign In / Register
              </Link>
            </>
          )}
        </div>
      </section>

      {/* What is a Carbon Footprint Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-ink-900 tracking-tight">
            What is a Carbon Footprint?
          </h2>
          <p className="text-sm text-ink-700 leading-relaxed">
            Every choice you make in your daily routine—from how you commute to what you eat for lunch—requires energy and resources. 
            When these resources are consumed, greenhouse gases (primarily carbon dioxide, or CO2) are emitted into the atmosphere, contributing to global warming.
          </p>
          <p className="text-sm text-ink-700 leading-relaxed font-semibold">
            Our platform breaks down your footprint into five primary life areas, giving you complete visibility into where you stand compared to global climate goals.
          </p>
        </div>

        {/* Visual Cards Grid for Footprint Sources */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <span className="text-xl" aria-hidden="true">🚗</span>
            <h3 className="font-bold text-xs text-ink-900 uppercase tracking-wider">Transport</h3>
            <p className="text-[11px] text-ink-500 leading-normal">
              Commuting habits, car usage, vehicle efficiency, and flight frequencies.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <span className="text-xl" aria-hidden="true">🏠</span>
            <h3 className="font-bold text-xs text-ink-900 uppercase tracking-wider">Home Energy</h3>
            <p className="text-[11px] text-ink-500 leading-normal">
              Electricity usage, heating fuels, and use of clean energy sources.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <span className="text-xl" aria-hidden="true">🍽️</span>
            <h3 className="font-bold text-xs text-ink-900 uppercase tracking-wider">Diet Habits</h3>
            <p className="text-[11px] text-ink-500 leading-normal">
              Consumption of red meat, dairy, local produce, and organic options.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <span className="text-xl" aria-hidden="true">🛍️</span>
            <h3 className="font-bold text-xs text-ink-900 uppercase tracking-wider">Consumption</h3>
            <p className="text-[11px] text-ink-500 leading-normal">
              Shopping habits for clothing, appliances, and electronics.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Flow */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 border border-slate-200/50 shadow-md mx-4">
        <h2 className="text-center text-2xl md:text-3xl font-black text-ink-900 tracking-tight mb-12">
          Start Your Climate Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center gap-3 relative">
            <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-black text-base flex items-center justify-center border border-brand-200 dark:border-brand-800/30">
              1
            </div>
            <h3 className="font-bold text-base text-ink-900">Track</h3>
            <p className="text-xs text-ink-700 leading-relaxed px-4">
              Complete our 5-step wizard calculator to get a highly customized estimation of your annual footprint.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3 relative">
            <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-black text-base flex items-center justify-center border border-brand-200 dark:border-brand-800/30">
              2
            </div>
            <h3 className="font-bold text-base text-ink-900">Analyze</h3>
            <p className="text-xs text-ink-700 leading-relaxed px-4">
              Explore responsive visual breakdown charts, comparative benchmarks, and historical trend trackers.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3 relative">
            <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-black text-base flex items-center justify-center border border-brand-200 dark:border-brand-800/30">
              3
            </div>
            <h3 className="font-bold text-base text-ink-900">Reduce</h3>
            <p className="text-xs text-ink-700 leading-relaxed px-4">
              Pick practical habits from our action library, set custom reduction targets, and watch your total savings accumulate.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="text-center flex flex-col items-center gap-5 px-4 mb-4 select-none">
        <h2 className="text-3xl font-black text-ink-900 tracking-tight">
          Ready to reduce your impact?
        </h2>
        <p className="text-sm text-ink-700 max-w-xl leading-relaxed">
          Join thousands of individuals managing their footprints. Try our calculator without registering, or make a free account to persist your progress.
        </p>
        <button
          type="button"
          onClick={handleGuestClick}
          disabled={isSubmitting}
          className="rounded-xl bg-brand-700 px-8 py-4 font-bold text-white shadow-md shadow-brand-100 hover:bg-brand-800 hover:scale-[1.02] transition-all text-sm disabled:opacity-60 mt-2"
        >
          {isSubmitting ? 'Starting Session...' : 'Start Tracking Now'}
        </button>
      </section>
    </div>
  );
}
