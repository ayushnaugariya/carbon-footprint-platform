import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-700 text-white' : 'text-brand-800 hover:bg-brand-100'
  ].join(' ');
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-brand-800">🌍 GreenTrack</span>

          {user ? (
            <nav aria-label="Main navigation" className="flex items-center gap-1">
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
              <span className="ml-3 hidden text-sm text-ink-500 sm:inline">Hi, {user.displayName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-gray-100"
              >
                Log out
              </button>
            </nav>
          ) : null}
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-ink-500">
        GreenTrack &mdash; understand, track, and reduce your carbon footprint.
      </footer>
    </div>
  );
}
