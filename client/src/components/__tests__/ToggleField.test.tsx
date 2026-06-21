import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleField } from '../ToggleField';

describe('ToggleField', () => {
  it('renders label correctly linked to checkbox via htmlFor/id', () => {
    render(<ToggleField id="test-toggle" label="Toggle Option" checked={false} onChange={() => {}} />);
    const checkbox = screen.getByLabelText('Toggle Option');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('id', 'test-toggle');
  });

  it('calls onChange with correct boolean value when clicked', async () => {
    const handleChange = vi.fn();
    render(<ToggleField id="test-toggle" label="Toggle Option" checked={false} onChange={handleChange} />);
    const checkbox = screen.getByLabelText('Toggle Option');
    await userEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('shows hint text when provided and links via aria-describedby', () => {
    render(
      <ToggleField
        id="test-toggle"
        label="Toggle Option"
        checked={false}
        onChange={() => {}}
        hint="This is a hint"
      />
    );
    const checkbox = screen.getByLabelText('Toggle Option');
    const hint = screen.getByText('This is a hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute('id', 'test-toggle-hint');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-toggle-hint');
  });

  it('supports toggling the checkbox via keyboard (spacebar)', async () => {
    const handleChange = vi.fn();
    render(<ToggleField id="test-toggle" label="Toggle Option" checked={false} onChange={handleChange} />);
    const checkbox = screen.getByLabelText('Toggle Option');
    checkbox.focus();
    expect(checkbox).toHaveFocus();
    await userEvent.keyboard('[Space]');
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
