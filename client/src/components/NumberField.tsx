import type { ChangeEvent } from 'react';

interface NumberFieldProps {
  id: string;
  label: string;
  unit?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  onChange: (value: number) => void;
}

export function NumberField({ id, label, unit, value, min = 0, max, step = 1, hint, onChange }: NumberFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value === '' ? 0 : Number(e.target.value);
    if (!Number.isNaN(next)) onChange(next);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink-700">
        {label} {unit ? <span className="text-ink-500">({unit})</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        aria-describedby={hintId}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
