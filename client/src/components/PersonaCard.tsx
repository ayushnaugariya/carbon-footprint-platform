import type { PersonaInfo } from '../types';

const FOCUS_EMOJI: Record<string, string> = {
  transport: '🚗',
  home: '🏠',
  diet: '🍽️',
  consumption: '🛍️',
  waste: '🗑️'
};

export function PersonaCard({ persona }: { persona: PersonaInfo }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Your lifestyle persona</p>
      <h3 className="mt-1 flex items-center gap-2 text-xl font-bold text-brand-900">
        <span aria-hidden="true">{FOCUS_EMOJI[persona.focus] ?? '🌍'}</span>
        {persona.title}
      </h3>
      <p className="mt-2 text-sm text-ink-700">{persona.description}</p>
    </div>
  );
}
