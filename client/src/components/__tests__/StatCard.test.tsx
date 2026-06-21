import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders the label, value, and hint correctly', () => {
    render(<StatCard label="Weekly footprint" value="120 kg" hint="Below national average" />);

    expect(screen.getByText('Weekly footprint')).toBeInTheDocument();
    expect(screen.getByText('120 kg')).toBeInTheDocument();
    expect(screen.getByText('Below national average')).toBeInTheDocument();
  });

  it('uses dl/dt/dd semantic structure for accessibility', () => {
    const { container } = render(<StatCard label="Annual total" value="5.2 tonnes" />);
    
    const dl = container.querySelector('dl');
    const dt = container.querySelector('dt');
    const dd = container.querySelector('dd');

    expect(dl).toBeInTheDocument();
    expect(dt).toBeInTheDocument();
    expect(dd).toBeInTheDocument();

    expect(dt?.textContent).toBe('Annual total');
    expect(dd?.textContent).toBe('5.2 tonnes');
  });

  it('renders icons as aria-hidden', () => {
    const { container } = render(<StatCard label="Carbon saved" value="45 kg" />);
    
    // Check if the icon container has aria-hidden
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
    
    const svg = iconContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
