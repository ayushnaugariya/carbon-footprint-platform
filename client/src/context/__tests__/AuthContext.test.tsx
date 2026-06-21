import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

// JWT-format mock tokens: three base64url segments separated by dots.
// These must pass the isJwtLike() validator in AuthContext without being real JWTs.
// The payload encodes an `exp` far in the future so the freshness check also passes.
// exp: 9999999999 → year 2286; safe for test longevity.
const MOCK_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const MOCK_GUEST_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyIiwiZXhwIjo5OTk5OTk5OTk5fQ.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
const MOCK_RESTORE_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';

function TestConsumer() {
  const { user, isLoading, login, continueAsGuest, logout, error } = useAuth();

  if (isLoading) return <p>loading</p>;

  return (
    <div>
      <p data-testid="user">{user ? user.displayName : 'none'}</p>
      {error ? <p data-testid="error">{error}</p> : null}
      <button onClick={() => login('a@b.com', 'password123')}>login</button>
      <button onClick={() => continueAsGuest('Guest Name')}>guest</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.getMe).mockReset();
    vi.mocked(api.login).mockReset();
    vi.mocked(api.guestLogin).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no user when there is no stored session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
  });

  it('logs in and exposes the returned user', async () => {
    vi.mocked(api.login).mockResolvedValue({
      token: MOCK_JWT,
      user: { id: '1', email: 'a@b.com', displayName: 'Alice', isGuest: false }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    await userEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Alice'));
    expect(window.localStorage.getItem('carbon_platform_token')).toBe(MOCK_JWT);
  });

  it('starts a guest session', async () => {
    vi.mocked(api.guestLogin).mockResolvedValue({
      token: MOCK_GUEST_JWT,
      user: { id: '2', email: null, displayName: 'Guest Name', isGuest: true }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    await userEvent.click(screen.getByText('guest'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Guest Name'));
  });

  it('logs out and clears the stored token', async () => {
    vi.mocked(api.login).mockResolvedValue({
      token: MOCK_JWT,
      user: { id: '1', email: 'a@b.com', displayName: 'Alice', isGuest: false }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    await userEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Alice'));

    await userEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(window.localStorage.getItem('carbon_platform_token')).toBeNull();
  });

  it('restores an existing session from localStorage on mount', async () => {
    window.localStorage.setItem('carbon_platform_token', MOCK_RESTORE_JWT);
    vi.mocked(api.getMe).mockResolvedValue({
      user: { id: '3', email: 'c@d.com', displayName: 'Carol', isGuest: false }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Carol'));
  });

  it('clears an invalid stored token if session restore fails', async () => {
    // 'bad-token' is not JWT-format so it gets evicted immediately without a network call.
    window.localStorage.setItem('carbon_platform_token', 'bad-token');
    vi.mocked(api.getMe).mockRejectedValue(new Error('Invalid or expired token'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(window.localStorage.getItem('carbon_platform_token')).toBeNull();
  });
});

