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
  const message =
    clamped <= 33
      ? 'Lower than most people in our comparison group - great work.'
      : clamped <= 66
        ? 'Around the middle of our comparison group.'
        : 'Higher than most people in our comparison group - there is room to improve.';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">How you compare</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">
        {clamped}
        {ordinalSuffix(clamped)} percentile
      </p>
      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Footprint percentile compared to similar lifestyles"
      >
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink-700">{message}</p>
      <p className="mt-1 text-xs text-ink-500">
        Lower percentile means a smaller footprint relative to a comparison population of similar lifestyle profiles.
      </p>
    </div>
  );
}
