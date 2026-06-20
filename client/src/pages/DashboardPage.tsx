import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BreakdownChart } from '../components/BreakdownChart';
import { PersonaCard } from '../components/PersonaCard';
import { PercentileBar } from '../components/PercentileBar';
import { StatCard } from '../components/StatCard';
import { RecommendationCard } from '../components/RecommendationCard';
import * as api from '../lib/api';
import type { CategoryBreakdown, FootprintEntry, PersonaInfo, RecommendationAction, TrendResult } from '../types';

function entryToBreakdown(entry: FootprintEntry): CategoryBreakdown {
  return {
    transport: entry.transport,
    home: entry.home,
    diet: entry.diet,
    consumption: entry.consumption,
    waste: entry.waste,
    totalWeeklyKgCo2e: entry.total_weekly,
    totalAnnualKgCo2e: entry.total_annual
  };
}

export function DashboardPage() {
  const [entry, setEntry] = useState<FootprintEntry | null>(null);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [trend, setTrend] = useState<TrendResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationAction[]>([]);
  const [totalSavingsKg, setTotalSavingsKg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [latest, recs, completed] = await Promise.all([
        api.getLatestFootprint(),
        api.getRecommendations(),
        api.getCompletedActions()
      ]);
      setEntry(latest.entry);
      setPersona(latest.persona);
      setPercentile(latest.percentile);
      setTrend(latest.trend);
      setRecommendations(recs.recommendations);
      setTotalSavingsKg(completed.totalSavingsKg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // loadData only ever calls setState from within try/catch/finally blocks
    // that run after its internal `await Promise.all(...)` - i.e. inside
    // resolved promise callbacks, which is exactly the pattern this rule
    // recommends. It is flagged here because the rule's static analysis
    // doesn't look past the useCallback boundary into the async body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  async function handleCompleteAction(actionId: string) {
    const res = await api.completeAction(actionId);
    setTotalSavingsKg(res.totalSavingsKg);
    setRecommendations((prev) => prev.filter((r) => r.id !== actionId));
  }

  if (isLoading) {
    return (
      <p role="status" aria-live="polite" className="py-16 text-center text-ink-500">
        Loading your dashboard&hellip;
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
        {error}
      </p>
    );
  }

  if (!entry || !persona || percentile === null) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Let&apos;s get your first reading</h1>
        <p className="mt-2 text-ink-700">Track your weekly habits once to unlock your personalized dashboard.</p>
        <Link
          to="/track"
          className="mt-6 inline-block rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Track my footprint
        </Link>
      </div>
    );
  }

  const breakdown = entryToBreakdown(entry);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Your dashboard</h1>
        <Link to="/track" className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          Log a new reading
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Weekly footprint" value={`${breakdown.totalWeeklyKgCo2e} kg CO2e`} />
        <StatCard label="Annual projection" value={`${(breakdown.totalAnnualKgCo2e / 1000).toFixed(1)} t CO2e`} hint="Based on your latest reading" />
        <StatCard label="Saved through actions" value={`${Math.round(totalSavingsKg * 10) / 10} kg CO2e / week`} hint="From completed recommendations" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink-900">Footprint by category</h2>
          <div className="mt-4">
            <BreakdownChart breakdown={breakdown} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <PersonaCard persona={persona} />
          <PercentileBar percentile={percentile} />
        </div>
      </div>

      {trend?.available ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink-900">Trend projection</h2>
          <p className="mt-1 text-sm text-ink-700">
            At your current rate, in 30 days your weekly footprint is projected to be{' '}
            <strong>{trend.projectedIn30Days} kg CO2e</strong> (
            {trend.percentChangeProjected !== undefined && trend.percentChangeProjected >= 0 ? '+' : ''}
            {trend.percentChangeProjected}% vs. your latest reading).
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-ink-500">
          {trend?.reason ?? 'Track a few more entries to unlock your trend projection.'}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Top recommendations for you</h2>
          <Link to="/actions" className="text-sm font-semibold text-brand-700 hover:underline">
            See all actions
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No new recommendations right now - nice work staying on top of things!</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {recommendations.map((action) => (
              <RecommendationCard key={action.id} action={action} onComplete={handleCompleteAction} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
