import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PercentileBar } from '../PercentileBar';

describe('PercentileBar', () => {
  it('displays the percentile value with the correct ordinal suffix', () => {
    render(<PercentileBar percentile={42} />);
    expect(screen.getByText('42nd percentile')).toBeInTheDocument();
  });

  it('uses "st" and "th" suffixes correctly for other values', () => {
    render(<PercentileBar percentile={21} />);
    expect(screen.getByText('21st percentile')).toBeInTheDocument();
  });

  it('exposes an accessible progressbar with correct bounds', () => {
    render(<PercentileBar percentile={75} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps out-of-range percentiles into 0-100', () => {
    render(<PercentileBar percentile={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows an encouraging message for low percentiles', () => {
    render(<PercentileBar percentile={10} />);
    expect(screen.getByText(/great work/i)).toBeInTheDocument();
  });

  it('shows a room-to-improve message for high percentiles', () => {
    render(<PercentileBar percentile={90} />);
    expect(screen.getByText(/room to improve/i)).toBeInTheDocument();
  });
});
