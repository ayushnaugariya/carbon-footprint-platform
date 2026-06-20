interface ToggleFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function ToggleField({ id, label, checked, onChange, hint }: ToggleFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-5 w-5 accent-brand-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={hintId}
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="text-xs text-ink-500">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
