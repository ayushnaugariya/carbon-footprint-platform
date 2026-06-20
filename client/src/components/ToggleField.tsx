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
      <div className="flex h-5 items-center">
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={hintId}
        />
      </div>
      <div>
        <label 
          htmlFor={id} 
          className="text-sm font-semibold text-ink-700 cursor-pointer hover:text-brand-700 select-none transition-colors duration-200"
        >
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="text-xs text-ink-500 mt-0.5 leading-relaxed">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
