import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getMe, guestLogin, setAuthToken } from '../api';

function mockFetchOnce(status: number, body: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body))
  }) as unknown as typeof fetch;
}

describe('api client', () => {
  beforeEach(() => {
    setAuthToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on a successful response', async () => {
    mockFetchOnce(201, { token: 'abc123', user: { id: '1', email: null, displayName: 'Guest', isGuest: true } });

    const res = await guestLogin('Guest');
    expect(res.token).toBe('abc123');
    expect(res.user.displayName).toBe('Guest');
  });

  it('throws an ApiError with the server message on failure', async () => {
    mockFetchOnce(401, { error: 'Invalid or expired token' });

    await expect(getMe()).rejects.toBeInstanceOf(ApiError);
    await expect(getMe()).rejects.toMatchObject({ message: 'Invalid or expired token', status: 401 });
  });

  it('attaches the Authorization header once a token is set', async () => {
    setAuthToken('my-token');
    mockFetchOnce(200, { user: { id: '1', email: 'a@b.com', displayName: 'A', isGuest: false } });

    await getMe();

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const options = callArgs[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer my-token');
  });

  it('does not attach an Authorization header when no token is set', async () => {
    mockFetchOnce(200, { user: { id: '1', email: 'a@b.com', displayName: 'A', isGuest: false } });

    await getMe();

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const options = callArgs[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});
