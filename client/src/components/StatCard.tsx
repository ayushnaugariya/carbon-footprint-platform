interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  // Determine icon and theme based on label
  const lowercaseLabel = label.toLowerCase();
  let icon = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  let themeColor = 'bg-brand-50 text-brand-700';

  if (lowercaseLabel.includes('weekly')) {
    icon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
    themeColor = 'bg-blue-50 text-blue-700';
  } else if (lowercaseLabel.includes('annual')) {
    icon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    );
    themeColor = 'bg-amber-50 text-amber-700';
  } else if (lowercaseLabel.includes('saved')) {
    icon = (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
    themeColor = 'bg-emerald-50 text-emerald-700';
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 border border-slate-200/60 shadow-sm shadow-slate-100/30">
      <div className={`p-2.5 rounded-xl ${themeColor} shrink-0`}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest truncate">{label}</p>
        <p className="text-xl font-black text-ink-900 tracking-tight mt-0.5">{value}</p>
        {hint ? <p className="text-[11px] text-ink-500 leading-normal mt-1">{hint}</p> : null}
      </div>
    </div>
  );
}
