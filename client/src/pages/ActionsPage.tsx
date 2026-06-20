import { useEffect, useMemo, useState } from 'react';
import { RecommendationCard } from '../components/RecommendationCard';
import { StatCard } from '../components/StatCard';
import * as api from '../lib/api';
import type { CompletedAction, RecommendationAction } from '../types';

const CATEGORY_LABEL: Record<string, string> = {
  transport: '🚗 Transport',
  home: '🏠 Home energy',
  diet: '🍽️ Diet',
  consumption: '🛍️ Shopping',
  waste: '🗑️ Waste'
};

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
type CategoryFilter = 'all' | 'transport' | 'home' | 'diet' | 'consumption' | 'waste';

export function ActionsPage() {
  const [catalog, setCatalog] = useState<RecommendationAction[]>([]);
  const [completed, setCompleted] = useState<CompletedAction[]>([]);
  const [totalSavingsKg, setTotalSavingsKg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('all');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    Promise.all([api.getActionCatalog(), api.getCompletedActions()])
      .then(([catalogRes, completedRes]) => {
        setCatalog(catalogRes.catalog);
        setCompleted(completedRes.completed);
        setTotalSavingsKg(completedRes.totalSavingsKg);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load actions'))
      .finally(() => setIsLoading(false));
  }, []);

  const completedIds = useMemo(() => new Set(completed.map((c) => c.action_id)), [completed]);

  async function handleComplete(actionId: string) {
    const res = await api.completeAction(actionId);
    setTotalSavingsKg(res.totalSavingsKg);
    setCompleted((prev) => [res.record, ...prev]);
  }

  // Filter & Search Logic
  const filteredActions = useMemo(() => {
    return catalog.filter((action) => {
      const matchesSearch = 
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDiff = diffFilter === 'all' || action.difficulty === diffFilter;
      const matchesCat = catFilter === 'all' || action.category === catFilter;

      return matchesSearch && matchesDiff && matchesCat;
    });
  }, [catalog, searchQuery, diffFilter, catFilter]);

  // Grouped by Category for display (only if Category filter is 'all')
  const grouped = useMemo(() => {
    const groups = new Map<string, RecommendationAction[]>();
    for (const action of filteredActions) {
      const list = groups.get(action.category) ?? [];
      list.push(action);
      groups.set(action.category, list);
    }
    return groups;
  }, [filteredActions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" role="status" aria-live="polite">
        <svg className="h-10 w-10 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-ink-500 font-medium text-sm">Loading action catalog…</p>
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

  const completionPercent = catalog.length > 0 ? Math.round((completed.length / catalog.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink-900">Action Library</h1>
          <p className="text-sm text-ink-700 mt-0.5">Explore practical actions you can take to lower your footprint.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total weekly savings" value={`${Math.round(totalSavingsKg * 10) / 10} kg CO2e`} />
          <StatCard label="Actions completed" value={`${completed.length} / ${catalog.length}`} hint={`${completionPercent}% of library unlocked`} />
          
          {/* Custom Mini Progress Card */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-2 border border-slate-200/60 shadow-sm justify-center">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">Library Progress</span>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: `${completionPercent}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-brand-700">{completionPercent}% of actions completed</span>
          </div>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-slate-200/50 shadow-sm">
        {/* Search Bar */}
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white/60 pl-10 pr-4 py-2.5 text-sm transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            placeholder="Search actions by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-5">
          {/* Category Filter Pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">Category</span>
            <div className="flex flex-wrap gap-1">
              {(['all', 'transport', 'home', 'diet', 'consumption', 'waste'] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                    catFilter === cat
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-100'
                      : 'bg-white hover:bg-slate-50 text-ink-700 border border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">Difficulty</span>
            <div className="flex flex-wrap gap-1">
              {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDiffFilter(diff)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                    diffFilter === diff
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-100'
                      : 'bg-white hover:bg-slate-50 text-ink-700 border border-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Catalog Listing */}
      <div className="flex flex-col gap-6 mt-2">
        {filteredActions.length === 0 ? (
          <div className="glass-panel border-dashed border-2 rounded-2xl p-12 text-center text-ink-500 text-sm">
            <p className="font-semibold">No actions match your filters.</p>
            <button 
              onClick={() => { setSearchQuery(''); setDiffFilter('all'); setCatFilter('all'); }} 
              className="mt-4 text-brand-600 font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : catFilter !== 'all' ? (
          // If a specific category is filtered, list without nested headers
          <ul className="flex flex-col gap-3">
            {filteredActions.map((action) => (
              <RecommendationCard
                key={action.id}
                action={action}
                onComplete={handleComplete}
                completed={completedIds.has(action.id)}
              />
            ))}
          </ul>
        ) : (
          // Grouped listing by default
          [...grouped.entries()].map(([category, actions]) => (
            <section key={category} className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider border-b border-slate-100 pb-1.5 mt-2">
                {CATEGORY_LABEL[category] ?? category}
              </h2>
              <ul className="flex flex-col gap-3">
                {actions.map((action) => (
                  <RecommendationCard
                    key={action.id}
                    action={action}
                    onComplete={handleComplete}
                    completed={completedIds.has(action.id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
