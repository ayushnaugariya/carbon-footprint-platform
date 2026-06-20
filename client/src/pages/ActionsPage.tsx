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

export function ActionsPage() {
  const [catalog, setCatalog] = useState<RecommendationAction[]>([]);
  const [completed, setCompleted] = useState<CompletedAction[]>([]);
  const [totalSavingsKg, setTotalSavingsKg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const grouped = useMemo(() => {
    const groups = new Map<string, RecommendationAction[]>();
    for (const action of catalog) {
      const list = groups.get(action.category) ?? [];
      list.push(action);
      groups.set(action.category, list);
    }
    return groups;
  }, [catalog]);

  async function handleComplete(actionId: string) {
    const res = await api.completeAction(actionId);
    setTotalSavingsKg(res.totalSavingsKg);
    setCompleted((prev) => [res.record, ...prev]);
  }

  if (isLoading) {
    return (
      <p role="status" aria-live="polite" className="py-16 text-center text-ink-500">
        Loading actions&hellip;
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">All actions</h1>
        <StatCard label="Total estimated savings" value={`${Math.round(totalSavingsKg * 10) / 10} kg CO2e / week`} />
      </div>

      {[...grouped.entries()].map(([category, actions]) => (
        <section key={category}>
          <h2 className="text-lg font-semibold text-ink-900">{CATEGORY_LABEL[category] ?? category}</h2>
          <ul className="mt-3 flex flex-col gap-3">
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
      ))}
    </div>
  );
}
