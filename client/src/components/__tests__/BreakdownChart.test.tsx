import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreakdownChart } from '../BreakdownChart';
import type { CategoryBreakdown } from '../../types';

const breakdown: CategoryBreakdown = {
  transport: 50.4,
  home: 20.1,
  diet: 35.7,
  consumption: 10.2,
  waste: 5.6,
  totalWeeklyKgCo2e: 122,
  totalAnnualKgCo2e: 6344
};

describe('BreakdownChart', () => {
  it('exposes an accessible image description summarizing every category', () => {
    render(<BreakdownChart breakdown={breakdown} />);
    const chart = screen.getByRole('img');
    expect(chart).toHaveAccessibleName(/Transport: 50.4 kg CO2e per week/);
    expect(chart).toHaveAccessibleName(/Diet: 35.7 kg CO2e per week/);
  });

  it('renders a screen-reader-only data table with all categories', () => {
    render(<BreakdownChart breakdown={breakdown} />);
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Home energy')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Waste')).toBeInTheDocument();
  });
});
