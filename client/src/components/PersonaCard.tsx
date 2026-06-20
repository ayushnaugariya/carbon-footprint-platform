import type { PersonaInfo } from '../types';

const PERSONA_THEMES: Record<string, { bg: string; border: string; text: string; badge: string; icon: string }> = {
  'commuter-heavy': {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50/40',
    border: 'border-blue-100',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    icon: '🚗'
  },
  'home-energy-heavy': {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50/40',
    border: 'border-amber-100',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800',
    icon: '🏠'
  },
  'diet-heavy': {
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50/40',
    border: 'border-emerald-100',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '🍽️'
  },
  'consumption-heavy': {
    bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50/40',
    border: 'border-purple-100',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
    icon: '🛍️'
  },
  'waste-heavy': {
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-50/40',
    border: 'border-slate-200',
    text: 'text-slate-900',
    badge: 'bg-slate-200 text-slate-800',
    icon: '🗑️'
  }
};

export function PersonaCard({ persona }: { persona: PersonaInfo }) {
  const theme = PERSONA_THEMES[persona.id] || {
    bg: 'bg-gradient-to-br from-brand-50 to-emerald-50/40',
    border: 'border-brand-100',
    text: 'text-brand-900',
    badge: 'bg-brand-100 text-brand-800',
    icon: '🌍'
  };

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-5 shadow-sm`}>
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge} mb-3`}>
        Lifestyle Persona
      </span>
      <h3 className={`flex items-center gap-2 text-lg font-bold ${theme.text}`}>
        <span className="text-xl" aria-hidden="true">{theme.icon}</span>
        {persona.title}
      </h3>
      <p className="mt-2 text-sm text-ink-700 leading-relaxed">{persona.description}</p>
    </div>
  );
}
