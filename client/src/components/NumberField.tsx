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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-ink-700">
        {label} {unit ? <span className="text-ink-500 font-normal">({unit})</span> : null}
      </label>
      <div className="relative rounded-lg shadow-sm">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-slate-200 bg-white/50 px-3.5 py-2.5 text-sm transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          value={value === 0 ? '' : value}
          placeholder="0"
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          aria-describedby={hintId}
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-[11px] text-ink-500 leading-normal">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
