import { __resetModelCacheForTests, computePercentile, computeTrend, detectPersona } from '../services/mlInsights';

describe('mlInsights', () => {
  beforeEach(() => {
    __resetModelCacheForTests();
  });

  describe('detectPersona', () => {
    it('identifies a transport-dominant profile as commuter-focused', () => {
      const persona = detectPersona({ transport: 150, home: 10, diet: 10, consumption: 5, waste: 2 });
      expect(persona.focus).toBe('transport');
    });

    it('identifies a home-energy-dominant profile correctly', () => {
      const persona = detectPersona({ transport: 10, home: 150, diet: 10, consumption: 5, waste: 2 });
      expect(persona.focus).toBe('home');
    });

    it('identifies a diet-dominant profile correctly', () => {
      const persona = detectPersona({ transport: 10, home: 10, diet: 150, consumption: 5, waste: 2 });
      expect(persona.focus).toBe('diet');
    });

    it('always returns a defined title and description', () => {
      const persona = detectPersona({ transport: 30, home: 30, diet: 30, consumption: 30, waste: 30 });
      expect(persona.title).toBeTruthy();
      expect(persona.description).toBeTruthy();
    });
  });

  describe('computePercentile', () => {
    it('returns 0 for a footprint of zero (better than everyone)', () => {
      expect(computePercentile(0)).toBe(0);
    });

    it('returns a high percentile for an extremely large footprint', () => {
      expect(computePercentile(100000)).toBeGreaterThanOrEqual(99);
    });

    it('returns values within the 0-100 bound for typical inputs', () => {
      const pct = computePercentile(150);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });

  describe('computeTrend', () => {
    it('reports unavailable with fewer than 3 points', () => {
      const result = computeTrend([
        { daysSinceStart: 0, totalKgCo2e: 100 },
        { daysSinceStart: 7, totalKgCo2e: 95 }
      ]);
      expect(result.available).toBe(false);
    });

    it('projects a declining trend correctly', () => {
      const result = computeTrend([
        { daysSinceStart: 0, totalKgCo2e: 100 },
        { daysSinceStart: 7, totalKgCo2e: 90 },
        { daysSinceStart: 14, totalKgCo2e: 80 }
      ]);
      expect(result.available).toBe(true);
      expect(result.model?.slope).toBeLessThan(0);
      expect(result.percentChangeProjected).toBeLessThan(0);
    });

    it('projects a rising trend correctly', () => {
      const result = computeTrend([
        { daysSinceStart: 0, totalKgCo2e: 80 },
        { daysSinceStart: 7, totalKgCo2e: 90 },
        { daysSinceStart: 14, totalKgCo2e: 100 }
      ]);
      expect(result.available).toBe(true);
      expect(result.model?.slope).toBeGreaterThan(0);
      expect(result.percentChangeProjected).toBeGreaterThan(0);
    });
  });
});
