import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { setAuthToken } from '../lib/api';
import type { AuthUser } from '../types';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'carbon_platform_token';

/**
 * Returns true if the string looks like a structurally-valid JWT
 * (three dot-separated Base64url segments). Does NOT verify the signature —
 * that is the server's responsibility. The check prevents obviously malformed
 * or injected strings from ever being used as auth tokens.
 */
function isJwtLike(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p));
}

/**
 * Decodes the JWT payload (without verifying the signature) and checks whether
 * the `exp` claim is in the future. Returns false if the token is expired or
 * if the payload cannot be decoded — in which case we skip the restore and
 * avoid a wasted /api/auth/me round-trip.
 */
function isTokenFreshClientSide(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    // Replace URL-safe chars and add padding for standard atob.
    const padded = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return true; // No exp = treat as valid.
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

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

      // Reject obviously malformed tokens before any network call.
      if (!isJwtLike(storedToken)) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Skip the /api/auth/me round-trip when the client-side exp claim has
      // already passed — the server would reject it anyway.
      if (!isTokenFreshClientSide(storedToken)) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }

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
    // Sanity-check the token format before persisting — rejects clearly bad tokens
    // that could only arrive from a buggy or compromised server response.
    if (!isJwtLike(token)) return;
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
