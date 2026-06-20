import { RECOMMENDATIONS_CATALOG, RecommendationAction } from '../data/recommendationsCatalog';
import { CategoryBreakdown } from './mlInsights';

export interface RankedRecommendation extends RecommendationAction {
  /** Relative priority score - higher means more impactful for this specific user. */
  priorityScore: number;
}

/**
 * Ranks the recommendation catalog for a specific user.
 *
 * Scoring rule: priority = (category's share of the user's total footprint)
 * x (the action's estimated savings). This means an action gets boosted both
 * for targeting a category the user is heavy in, AND for how much it
 * actually saves - so a small win in a dominant category can still rank
 * below a bigger win in a moderate category.
 *
 * Results are capped per category (maxPerCategory) so the final list stays
 * diverse instead of being dominated by a single category, and previously
 * completed action ids can be excluded.
 */
export function rankRecommendations(
  breakdown: CategoryBreakdown,
  options: { limit?: number; maxPerCategory?: number; excludeActionIds?: string[] } = {}
): RankedRecommendation[] {
  const { limit = 6, maxPerCategory = 2, excludeActionIds = [] } = options;

  const total = breakdown.transport + breakdown.home + breakdown.diet + breakdown.consumption + breakdown.waste;
  const shareByCategory = {
    transport: total === 0 ? 0.2 : breakdown.transport / total,
    home: total === 0 ? 0.2 : breakdown.home / total,
    diet: total === 0 ? 0.2 : breakdown.diet / total,
    consumption: total === 0 ? 0.2 : breakdown.consumption / total,
    waste: total === 0 ? 0.2 : breakdown.waste / total
  };

  const excluded = new Set(excludeActionIds);

  const scored: RankedRecommendation[] = RECOMMENDATIONS_CATALOG.filter((a) => !excluded.has(a.id)).map((action) => ({
    ...action,
    priorityScore: Math.round(shareByCategory[action.category] * action.estimatedWeeklySavingsKg * 100) / 100
  }));

  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  const result: RankedRecommendation[] = [];
  const countPerCategory: Record<string, number> = {};

  for (const rec of scored) {
    const used = countPerCategory[rec.category] ?? 0;
    if (used >= maxPerCategory) continue;
    result.push(rec);
    countPerCategory[rec.category] = used + 1;
    if (result.length >= limit) break;
  }

  return result;
}
