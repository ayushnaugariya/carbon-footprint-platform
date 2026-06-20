import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from '../NumberField';

describe('NumberField', () => {
  it('renders the label, unit, and current value', () => {
    render(<NumberField id="km" label="Petrol car" unit="km/week" value={42} onChange={() => {}} />);

    expect(screen.getByLabelText(/Petrol car/)).toHaveValue(42);
    expect(screen.getByText('(km/week)')).toBeInTheDocument();
  });

  it('calls onChange with the new numeric value when edited', async () => {
    const handleChange = vi.fn();

    function Harness() {
      const [value, setValue] = useState(0);
      return (
        <NumberField
          id="km"
          label="Petrol car"
          value={value}
          onChange={(v) => {
            handleChange(v);
            setValue(v);
          }}
        />
      );
    }

    render(<Harness />);

    const input = screen.getByLabelText(/Petrol car/);
    await userEvent.clear(input);
    await userEvent.type(input, '15');

    expect(handleChange).toHaveBeenLastCalledWith(15);
    expect(input).toHaveValue(15);
  });

  it('renders an associated hint when provided', () => {
    render(<NumberField id="flights" label="Short-haul flights" value={0} onChange={() => {}} hint="Under ~1,500 km" />);
    expect(screen.getByText('Under ~1,500 km')).toBeInTheDocument();
  });
});
