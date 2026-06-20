import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

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
      token: 'tok',
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
    expect(window.localStorage.getItem('carbon_platform_token')).toBe('tok');
  });

  it('starts a guest session', async () => {
    vi.mocked(api.guestLogin).mockResolvedValue({
      token: 'guest-tok',
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
      token: 'tok',
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
    window.localStorage.setItem('carbon_platform_token', 'existing-token');
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
