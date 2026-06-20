import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationCard } from '../RecommendationCard';
import type { RecommendationAction } from '../../types';

const action: RecommendationAction = {
  id: 'transport-bike-commute',
  category: 'transport',
  title: 'Bike or walk one commute a week',
  description: 'Swap one car commute for cycling or walking.',
  estimatedWeeklySavingsKg: 9.6,
  difficulty: 'easy'
};

describe('RecommendationCard', () => {
  it('renders the action title, description, and savings estimate', () => {
    render(<RecommendationCard action={action} />);
    expect(screen.getByText(action.title)).toBeInTheDocument();
    expect(screen.getByText(action.description)).toBeInTheDocument();
    expect(screen.getByText(/9.6 kg CO2e saved/)).toBeInTheDocument();
  });

  it('calls onComplete and shows a completed state when the button is clicked', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    render(<RecommendationCard action={action} onComplete={onComplete} />);

    const button = screen.getByRole('button', { name: /mark complete/i });
    await userEvent.click(button);

    expect(onComplete).toHaveBeenCalledWith(action.id);
    await waitFor(() => expect(screen.getByRole('button', { name: /completed/i })).toBeDisabled());
  });

  it('renders as already completed when the completed prop is true', () => {
    render(<RecommendationCard action={action} onComplete={vi.fn()} completed />);
    expect(screen.getByRole('button', { name: /completed/i })).toBeDisabled();
  });

  it('does not render a button when onComplete is not provided', () => {
    render(<RecommendationCard action={action} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
