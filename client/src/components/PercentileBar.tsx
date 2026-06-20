function ordinalSuffix(n: number): string {
  const remainder100 = n % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function PercentileBar({ percentile }: { percentile: number }) {
  const clamped = Math.min(100, Math.max(0, percentile));
  
  const textTheme = clamped <= 33
    ? { color: 'text-emerald-700 bg-emerald-50/50 border-emerald-100', text: 'Lower than most people in our comparison group - great work.' }
    : clamped <= 66
      ? { color: 'text-amber-700 bg-amber-50/50 border-amber-100', text: 'Around the middle of our comparison group.' }
      : { color: 'text-rose-700 bg-rose-50/50 border-rose-100', text: 'Higher than most people in our comparison group - there is room to improve.' };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
      <div>
        <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">How you compare</p>
        <p className="mt-1 text-2xl font-black text-ink-900">
          {clamped}
          {ordinalSuffix(clamped)} percentile
        </p>
      </div>

      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Footprint percentile compared to similar lifestyles"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${textTheme.color}`}>
        {textTheme.text}
      </div>

      <p className="text-[10px] text-ink-500 leading-normal">
        Lower percentile means a smaller footprint relative to a comparison population of similar lifestyle profiles.
      </p>
    </div>
  );
}
