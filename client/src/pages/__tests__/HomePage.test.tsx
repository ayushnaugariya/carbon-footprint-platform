import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../HomePage';
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
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  };
});

describe('HomePage', () => {
  const mockContinueAsGuest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      continueAsGuest: mockContinueAsGuest,
    } as any);
  });

  it('renders hero section and brand information', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Small steps, big impact/i)).toBeInTheDocument();
    expect(screen.getByText(/Track your carbon footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Live GreenTrack Network Activity/i)).toBeInTheDocument();
  });

  it('calculates carbon footprint dynamically and updates offset equivalents', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Initial value is around 5.4 tons based on defaults
    const estimateText = screen.getByText(/Metric Tons CO2e \/ Year/i);
    expect(estimateText).toBeInTheDocument();

    const slider = screen.getByLabelText('Weekly Driving');
    expect(slider).toBeInTheDocument();

    // Adjust weekly driving to 400 km
    fireEvent.change(slider, { target: { value: '400' } });

    // Verify slider text updates
    expect(screen.getByText('400 km')).toBeInTheDocument();

    // Tonnage value should increase to 8.0
    expect(screen.getByText('8.0')).toBeInTheDocument();

    // Check that offset equivalents are displayed
    expect(screen.getByTestId('offset-equivalents-section')).toBeInTheDocument();
  });

  it('allows user to interactive click and submit answers in the quiz', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('climate-quiz-section')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-score')).toHaveTextContent('Score: 0 / 3');

    // First question: food with largest carbon footprint
    const optionBeef = screen.getByRole('button', { name: 'Beef' });
    await userEvent.click(optionBeef);

    // Should show correct indicator
    expect(screen.getByTestId('quiz-result-heading')).toHaveTextContent('🎉 Correct!');
    expect(screen.getByTestId('quiz-score')).toHaveTextContent('Score: 1 / 3');

    // Click next
    const nextBtn = screen.getByTestId('next-quiz-btn');
    await userEvent.click(nextBtn);

    // Should load the second question (Mature tree CO2 absorption)
    expect(screen.getByTestId('quiz-question-text')).toHaveTextContent(/On average, how much CO2 does a single mature tree absorb in a full year/i);
  });

  it('triggers guest session login when "Try instantly as Guest" is clicked', async () => {
    mockContinueAsGuest.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const guestBtn = screen.getByRole('button', { name: /Try instantly as Guest/i });
    await userEvent.click(guestBtn);

    expect(mockContinueAsGuest).toHaveBeenCalled();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });
});
