import { rankRecommendations } from '../services/rulesEngine';

describe('rulesEngine.rankRecommendations', () => {
  it('returns recommendations skewed toward the user\'s dominant category', () => {
    const breakdown = { transport: 200, home: 10, diet: 10, consumption: 10, waste: 10 };
    const recs = rankRecommendations(breakdown, { limit: 6, maxPerCategory: 6 });

    const transportCount = recs.filter((r) => r.category === 'transport').length;
    expect(transportCount).toBeGreaterThan(0);
    // Transport recommendations should appear before most non-transport ones given the heavy skew.
    expect(recs[0].category).toBe('transport');
  });

  it('respects the maxPerCategory cap to keep results diverse', () => {
    const breakdown = { transport: 500, home: 5, diet: 5, consumption: 5, waste: 5 };
    const recs = rankRecommendations(breakdown, { limit: 10, maxPerCategory: 2 });
    const transportCount = recs.filter((r) => r.category === 'transport').length;
    expect(transportCount).toBeLessThanOrEqual(2);
  });

  it('excludes already-completed action ids', () => {
    const breakdown = { transport: 50, home: 50, diet: 50, consumption: 50, waste: 50 };
    const recs = rankRecommendations(breakdown, { excludeActionIds: ['transport-bike-commute', 'home-thermostat'] });
    const ids = recs.map((r) => r.id);
    expect(ids).not.toContain('transport-bike-commute');
    expect(ids).not.toContain('home-thermostat');
  });

  it('respects the limit parameter', () => {
    const breakdown = { transport: 50, home: 50, diet: 50, consumption: 50, waste: 50 };
    const recs = rankRecommendations(breakdown, { limit: 3, maxPerCategory: 5 });
    expect(recs.length).toBeLessThanOrEqual(3);
  });

  it('handles an all-zero breakdown without throwing', () => {
    const breakdown = { transport: 0, home: 0, diet: 0, consumption: 0, waste: 0 };
    expect(() => rankRecommendations(breakdown)).not.toThrow();
  });
});
