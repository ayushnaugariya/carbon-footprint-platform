import { Link, NavLink, useNavigate } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ease-in-out',
    isActive 
      ? 'bg-brand-600 text-white shadow-md shadow-brand-100/50 scale-[1.02]' 
      : 'text-ink-700 hover:text-brand-700 hover:bg-brand-50'
  ].join(' ');
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dark Mode state management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('green_track_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('green_track_theme', theme);
  }, [theme]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Get initials for the user avatar
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'GT';

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative overflow-x-hidden transition-colors duration-300">
      {/* Premium Background Decorative Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 dark:bg-emerald-950/20 blur-[130px] transition-colors duration-300" />
        <div className="absolute top-[25%] -right-[15%] w-[800px] h-[800px] rounded-full bg-teal-200/30 dark:bg-teal-950/15 blur-[160px] transition-colors duration-300" />
        <div className="absolute -bottom-[10%] left-[15%] w-[550px] h-[550px] rounded-full bg-lime-200/25 dark:bg-lime-950/10 blur-[120px] transition-colors duration-300" />
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#16a34a 1px, transparent 1px), radial-gradient(#16a34a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />
      </div>

      <a href="#main-content" className="skip-link relative z-50">
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/40 bg-white/70 dark:bg-[#121b18]/70 backdrop-blur-md relative transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <svg 
              className="h-7 w-7 text-brand-600 transition-transform duration-300 hover:rotate-12" 
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
            <span className="text-xl font-bold tracking-tight text-brand-900 dark:text-slate-100">
              Green<span className="text-brand-600">Track</span>
            </span>
          </Link>

          {user ? (
            <nav aria-label="Main navigation" className="flex items-center gap-1.5">
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/track" className={navLinkClasses}>
                Track footprint
              </NavLink>
              <NavLink to="/actions" className={navLinkClasses}>
                Actions
              </NavLink>
              <NavLink to="/history" className={navLinkClasses}>
                History
              </NavLink>
              
              <div className="ml-3 flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  className="rounded-lg p-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {theme === 'light' ? (
                    // Moon Icon (light mode active)
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    // Sun Icon (dark mode active)
                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </button>

                <span className="hidden text-sm font-medium text-ink-700 md:inline" title={user.displayName}>
                  {user.displayName}
                </span>
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-sm font-bold text-brand-700 dark:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  role="img"
                  aria-label={`User avatar: ${initials}`}
                  tabIndex={0}
                >
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="ml-1 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  Log out
                </button>
              </div>
            </nav>
          ) : (
            <nav aria-label="Main navigation" className="flex items-center gap-1.5">
              <NavLink to="/" end className={navLinkClasses}>
                Home
              </NavLink>
              
              <div className="ml-3 flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  className="rounded-lg p-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {theme === 'light' ? (
                    // Moon Icon (light mode active)
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    // Sun Icon (dark mode active)
                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </button>

                <NavLink to="/login" className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800/40">
                  Log In / Sign Up
                </NavLink>
              </div>
            </nav>
          )}

        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="border-t border-slate-200/30 bg-white/40 dark:bg-[#121b18]/40 backdrop-blur-sm py-6 text-center text-sm text-ink-500 relative z-10 transition-colors duration-300">
        <div className="flex items-center justify-center gap-1.5">
          <span>GreenTrack</span>
          <span className="text-brand-400" aria-hidden="true">•</span>
          <span>Understand, track, and reduce your carbon footprint.</span>
        </div>
      </footer>
    </div>
  );
}
