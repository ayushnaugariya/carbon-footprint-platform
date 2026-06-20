import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BreakdownChart } from '../components/BreakdownChart';
import { TrendChart } from '../components/TrendChart';
import { PersonaCard } from '../components/PersonaCard';
import { PercentileBar } from '../components/PercentileBar';
import { StatCard } from '../components/StatCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { useAuth } from '../hooks/useAuth';
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
  const { user } = useAuth();
  const displayName = user?.displayName || 'Friend';
  
  const [entry, setEntry] = useState<FootprintEntry | null>(null);
  const [persona, setPersona] = useState<PersonaInfo | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [trend, setTrend] = useState<TrendResult | null>(null);
  const [historyEntries, setHistoryEntries] = useState<FootprintEntry[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationAction[]>([]);
  const [totalSavingsKg, setTotalSavingsKg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reduction target from localStorage (defaults to 20%)
  const [targetReduction, setTargetReduction] = useState<number>(() => {
    const saved = localStorage.getItem('green_track_target_reduction');
    return saved ? Number(saved) : 20;
  });

  const loadData = useCallback(async () => {
    try {
      const [latest, recs, completed, history] = await Promise.all([
        api.getLatestFootprint(),
        api.getRecommendations(),
        api.getCompletedActions(),
        api.getFootprintHistory()
      ]);
      setEntry(latest.entry);
      setPersona(latest.persona);
      setPercentile(latest.percentile);
      setTrend(latest.trend);
      setRecommendations(recs.recommendations);
      setTotalSavingsKg(completed.totalSavingsKg);
      setHistoryEntries(history.entries);
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
    // Reload history to capture updated trend calculation
    api.getFootprintHistory().then(history => setHistoryEntries(history.entries));
  }

  const handleTargetChange = (val: number) => {
    setTargetReduction(val);
    localStorage.setItem('green_track_target_reduction', String(val));
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" role="status" aria-live="polite">
        <svg className="h-10 w-10 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-ink-500 font-medium text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700 font-medium flex items-center gap-3">
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!entry || !persona || percentile === null) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center max-w-xl mx-auto my-8 border-dashed border-2">
        <div className="p-4 bg-brand-50 rounded-full text-brand-600 mb-5 animate-bounce">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-ink-900 tracking-tight">Let&apos;s get your first reading</h1>
        <p className="mt-3 text-ink-700 text-sm max-w-sm">Track your weekly habits once to unlock your personalized carbon dashboard and insights.</p>
        <Link
          to="/track"
          className="mt-6 rounded-xl bg-brand-700 px-6 py-3 font-bold text-white shadow-md shadow-brand-200 transition-colors hover:bg-brand-800 text-sm"
        >
          Track my footprint
        </Link>
      </div>
    );
  }

  const breakdown = entryToBreakdown(entry);
  
  // Goal tracking math
  const weeklyFootprint = breakdown.totalWeeklyKgCo2e;
  const targetWeekly = Math.max(0, weeklyFootprint * (1 - targetReduction / 100));
  const netWeekly = Math.max(0, weeklyFootprint - totalSavingsKg);
  const percentSavings = weeklyFootprint > 0 ? Math.round((totalSavingsKg / weeklyFootprint) * 100) : 0;
  const isGoalMet = netWeekly <= targetWeekly;

  return (
    <div className="flex flex-col gap-8">
      {/* Date Greeting Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-xs font-bold text-ink-500 uppercase tracking-widest">{todayStr}</p>
          <h1 className="text-2xl font-black tracking-tight text-ink-900 mt-1">
            Good day, <span className="text-brand-700">{displayName}</span>
          </h1>
          <p className="text-sm text-ink-700 mt-0.5">Track your changes, stay motivated, and reduce your footprint.</p>
        </div>
        <Link to="/track" className="rounded-xl border border-brand-600 bg-white px-4 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors shadow-sm">
          Log a new reading
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Weekly footprint" value={`${breakdown.totalWeeklyKgCo2e} kg CO2e`} />
        <StatCard label="Annual projection" value={`${(breakdown.totalAnnualKgCo2e / 1000).toFixed(1)} t CO2e`} hint="Based on your latest reading" />
        <StatCard label="Saved through actions" value={`${Math.round(totalSavingsKg * 10) / 10} kg CO2e / week`} hint="From completed recommendations" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/50">
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">Footprint by category</h2>
          <BreakdownChart breakdown={breakdown} />
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/50">
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">Trend projection</h2>
          {trend?.available ? (
            <div className="flex flex-col gap-4">
              <TrendChart entries={historyEntries} />
              <p className="text-xs text-ink-700 border-t border-slate-100 pt-3 leading-relaxed">
                At your current rate, in 30 days your weekly footprint is projected to be{' '}
                <strong className="text-ink-900">{trend.projectedIn30Days} kg CO2e</strong> ({' '}
                <span className={trend.percentChangeProjected !== undefined && trend.percentChangeProjected >= 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {trend.percentChangeProjected !== undefined && trend.percentChangeProjected >= 0 ? '+' : ''}
                  {trend.percentChangeProjected}%
                </span>{' '}
                vs. latest).
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-ink-500 leading-relaxed bg-white/40">
              {trend?.reason ?? 'Track a few more entries to unlock your trend projection.'}
            </div>
          )}
        </div>
      </div>

      {/* Insights Row: Persona / Percentile & Goal Tracker */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Persona & Percentile */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PersonaCard persona={persona} />
          <PercentileBar percentile={percentile} />
        </div>

        {/* Right Column: Goal Tracker */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-200/50 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-brand-50 rounded-lg text-brand-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider">Carbon Reduction Goal Tracker</h2>
            </div>
            
            <p className="text-xs text-ink-700 leading-relaxed mt-4">
              Set your target reduction goal. Complete recommendations to lower your net footprint and hit your milestones.
            </p>

            {/* Target Slider */}
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-ink-700">
                <span>Set Target Reduction:</span>
                <span className="text-brand-700 px-2 py-0.5 bg-brand-50 border border-brand-100 rounded-md">{targetReduction}%</span>
              </div>
              <input 
                type="range"
                min="10"
                max="50"
                step="5"
                value={targetReduction}
                onChange={(e) => handleTargetChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-ink-300 px-1">
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </div>
          </div>

          {/* Goal Statistics */}
          <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wide">Net Weekly</span>
                <p className="text-sm font-bold text-ink-900 mt-0.5">{netWeekly.toFixed(1)} kg</p>
              </div>
              <div className="p-2 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wide">Target Goal</span>
                <p className="text-sm font-bold text-ink-900 mt-0.5">{targetWeekly.toFixed(1)} kg</p>
              </div>
              <div className="p-2 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wide">Saved Share</span>
                <p className="text-sm font-bold text-ink-900 mt-0.5">{percentSavings}%</p>
              </div>
            </div>

            {/* Progress indicators bar */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-500">
                <span>Milestone progress:</span>
                <span>{percentSavings}% / {targetReduction}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isGoalMet ? 'bg-emerald-500' : 'bg-brand-500'}`}
                  style={{ width: `${Math.min(100, (percentSavings / targetReduction) * 100)}%` }}
                />
              </div>
            </div>

            {/* Goal feedback badge */}
            {isGoalMet ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 font-bold justify-center animate-pulse shadow-sm">
                <span>🎉</span>
                <span>Goal achieved! You are tracking below your {targetReduction}% target footprint!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-100 p-3 text-xs text-brand-800 font-bold justify-center shadow-sm">
                <span>💡</span>
                <span>Complete {Math.ceil((netWeekly - targetWeekly) / 3)} more medium actions to meet your target.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-md font-bold text-ink-900 uppercase tracking-wider">Top recommendations for you</h2>
          <Link to="/actions" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-0.5">
            See all actions
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center border-dashed border-2 text-xs text-ink-500 mt-4 leading-normal">
            No new recommendations right now - nice work staying on top of things!
          </div>
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
