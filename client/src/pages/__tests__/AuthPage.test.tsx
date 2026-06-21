import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPage } from '../AuthPage';
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
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-redirect" data-to={to} />
  };
});

describe('AuthPage', () => {
  const mockLogin = vi.fn();
  const mockSignup = vi.fn();
  const mockContinueAsGuest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: mockLogin,
      signup: mockSignup,
      continueAsGuest: mockContinueAsGuest,
    } as any);
  });

  it('renders login form by default', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Display name/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('switches to signup mode when "Sign up" tab is clicked', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const signupTab = screen.getByRole('tab', { name: /sign up/i });
    await userEvent.click(signupTab);

    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows password complexity hint in signup mode', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const signupTab = screen.getByRole('tab', { name: /sign up/i });
    await userEvent.click(signupTab);

    const hint = screen.getByText(/Must be at least 8 characters with one uppercase letter and one digit/i);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute('id', 'password-hint');

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-hint');
  });

  it('shows error message with aria-live="polite" and role="alert" when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid email or password'));

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(loginButton);

    await waitFor(() => {
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveAttribute('aria-live', 'polite');
      expect(errorMsg).toHaveTextContent('Invalid email or password');
    });
  });

  it('submits guest login', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const guestButton = screen.getByRole('button', { name: /continue as guest/i });
    await userEvent.click(guestButton);

    expect(mockContinueAsGuest).toHaveBeenCalled();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('redirects to dashboard when user is already logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', displayName: 'Jane Doe', email: 'jane@example.com', isGuest: false },
      login: mockLogin,
      signup: mockSignup,
      continueAsGuest: mockContinueAsGuest,
    } as any);

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const redirect = screen.getByTestId('navigate-redirect');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/dashboard');
  });
});
