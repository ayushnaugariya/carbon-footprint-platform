import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FootprintForm } from '../FootprintForm';

describe('FootprintForm', () => {
  it('submits the default (all-zero, average diet) input when nothing is changed', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FootprintForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /calculate my footprint/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.transport.carPetrolKmPerWeek).toBe(0);
    expect(submitted.diet.type).toBe('average');
  });

  it('reflects an updated transport field in the submitted input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FootprintForm onSubmit={onSubmit} />);

    const petrolInput = screen.getByLabelText(/Petrol car/);
    await userEvent.clear(petrolInput);
    await userEvent.type(petrolInput, '120');

    await userEvent.click(screen.getByRole('button', { name: /calculate my footprint/i }));

    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.transport.carPetrolKmPerWeek).toBe(120);
  });

  it('updates the selected diet type when a different option is chosen', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FootprintForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('radio', { name: /vegan/i }));
    await userEvent.click(screen.getByRole('button', { name: /calculate my footprint/i }));

    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.diet.type).toBe('vegan');
  });

  it('shows an error message if the submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<FootprintForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /calculate my footprint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
  });

  it('toggles the renewable electricity flag', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FootprintForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText(/renewable.*green tariff/i));
    await userEvent.click(screen.getByRole('button', { name: /calculate my footprint/i }));

    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.home.usesRenewableElectricity).toBe(true);
  });
});
