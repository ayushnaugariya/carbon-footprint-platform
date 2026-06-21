import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from '../Layout';
import { useAuth } from '../../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Layout', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders skip link pointing to #main-content', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
    } as any);

    render(
      <MemoryRouter>
        <Layout>Test Content</Layout>
      </MemoryRouter>
    );

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders theme toggle button with correct dynamic aria-label', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
    } as any);

    render(
      <MemoryRouter>
        <Layout>Test Content</Layout>
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /switch to/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('mode'));
  });

  it('renders navigation links when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', displayName: 'Jane Doe', email: 'jane@example.com', isGuest: false },
      logout: mockLogout,
    } as any);

    render(
      <MemoryRouter>
        <Layout>Test Content</Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /track footprint/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /actions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /log in \/ sign up/i })).not.toBeInTheDocument();
  });

  it('renders login/signup link when logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
    } as any);

    render(
      <MemoryRouter>
        <Layout>Test Content</Layout>
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in \/ sign up/i })).toBeInTheDocument();
  });

  it('handles logout flow', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', displayName: 'Jane Doe', email: 'jane@example.com', isGuest: false },
      logout: mockLogout,
    } as any);

    render(
      <MemoryRouter>
        <Layout>Test Content</Layout>
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /log out/i });
    await userEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
