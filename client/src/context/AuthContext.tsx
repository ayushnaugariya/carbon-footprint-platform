import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { setAuthToken } from '../lib/api';
import type { AuthUser } from '../types';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'carbon_platform_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Resolving an existing session always goes through this async function,
    // so isLoading is only ever set from within a resolved promise callback -
    // never synchronously in the effect body itself.
    async function resolveExistingSession() {
      const storedToken = window.localStorage.getItem(STORAGE_KEY);
      if (!storedToken) return;

      setAuthToken(storedToken);
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
      }
    }

    resolveExistingSession().finally(() => setIsLoading(false));
  }, []);

  const persistSession = useCallback((token: string, nextUser: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, token);
    setAuthToken(token);
    setUser(nextUser);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null);
      try {
        const res = await api.signup(email, password, displayName);
        persistSession(res.token, res.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed');
        throw err;
      }
    },
    [persistSession]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const res = await api.login(email, password);
        persistSession(res.token, res.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      }
    },
    [persistSession]
  );

  const continueAsGuest = useCallback(
    async (displayName?: string) => {
      setError(null);
      try {
        const res = await api.guestLogin(displayName);
        persistSession(res.token, res.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start guest session');
        throw err;
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, signup, login, continueAsGuest, logout }),
    [user, isLoading, error, signup, login, continueAsGuest, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
