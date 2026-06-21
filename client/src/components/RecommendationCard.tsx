import { useState } from 'react';
import type { RecommendationAction } from '../types';

const DIFFICULTY_STYLE: Record<RecommendationAction['difficulty'], string> = {
  easy: 'bg-brand-100 text-brand-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-red-100 text-red-800'
};

interface RecommendationCardProps {
  action: RecommendationAction;
  onComplete?: (actionId: string) => Promise<void>;
  completed?: boolean;
}

export function RecommendationCard({ action, onComplete, completed = false }: RecommendationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(completed);

  async function handleComplete() {
    if (!onComplete || isDone) return;
    setIsSubmitting(true);
    try {
      await onComplete(action.id);
      setIsDone(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-ink-900">{action.title}</h4>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[action.difficulty]}`}>
            {action.difficulty}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-700">{action.description}</p>
        <p className="mt-1 text-xs font-medium text-brand-700">
          ~{action.estimatedWeeklySavingsKg} kg CO2e saved / week
        </p>
      </div>

      {/* Screen reader live region announces when an action is marked complete */}
      <span aria-live="polite" className="sr-only">
        {isDone ? `${action.title} marked as complete.` : ''}
      </span>

      {onComplete ? (
        <button
          type="button"
          onClick={handleComplete}
          disabled={isDone || isSubmitting}
          aria-pressed={isDone}
          aria-label={
            isDone
              ? `${action.title} — completed`
              : `Mark ${action.title} as complete`
          }
          className={[
            'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            isDone ? 'bg-brand-600 text-white' : 'border border-brand-600 text-brand-700 hover:bg-brand-50'
          ].join(' ')}
        >
          {isDone ? '✓ Completed' : isSubmitting ? 'Saving…' : 'Mark complete'}
        </button>
      ) : null}
    </li>
  );
}
