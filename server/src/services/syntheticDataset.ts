import { mulberry32, randRange } from '../utils/seededRandom';
import { Vector } from './kmeans';

/**
 * Category dimension order used consistently across the ML layer.
 * All vectors in this module represent weekly kg CO2e per category.
 */
export const CATEGORY_DIMENSIONS = ['transport', 'home', 'diet', 'consumption', 'waste'] as const;
export type CategoryDimension = (typeof CATEGORY_DIMENSIONS)[number];

interface Archetype {
  name: string;
  /** Mean weekly kg CO2e per category, in CATEGORY_DIMENSIONS order. */
  mean: Vector;
  /** Standard deviation per category, in CATEGORY_DIMENSIONS order. */
  stdDev: Vector;
}

// Four illustrative lifestyle archetypes used to seed a realistic, varied
// synthetic population. Each archetype is "heavy" in one category, which
// gives the k-means model meaningful, separable clusters to discover - this
// mirrors common real-world lifestyle patterns without using any real
// personal data.
const ARCHETYPES: Archetype[] = [
  { name: 'commuter-heavy', mean: [70, 25, 35, 15, 5], stdDev: [15, 8, 6, 5, 2] },
  { name: 'home-energy-heavy', mean: [20, 80, 35, 15, 5], stdDev: [8, 18, 6, 5, 2] },
  { name: 'diet-heavy', mean: [20, 25, 70, 15, 5], stdDev: [8, 8, 14, 5, 2] },
  { name: 'consumption-heavy', mean: [20, 25, 35, 55, 8], stdDev: [8, 8, 6, 14, 3] }
];

export interface SyntheticProfile {
  vector: Vector;
  archetype: string;
}

/**
 * Generates a deterministic synthetic population by sampling around each
 * archetype's mean with Gaussian-like noise (Box-Muller via the seeded PRNG).
 * Deterministic seeding means the same dataset (and therefore the same
 * cluster centroids) is produced on every server start and in every test run.
 */
export function generateSyntheticDataset(size = 320, seed = 42): SyntheticProfile[] {
  const rng = mulberry32(seed);
  const profiles: SyntheticProfile[] = [];
  const perArchetype = Math.floor(size / ARCHETYPES.length);

  for (const archetype of ARCHETYPES) {
    for (let i = 0; i < perArchetype; i++) {
      const vector = archetype.mean.map((mean, dim) => {
        // Box-Muller transform for approximately normal noise, using the seeded RNG.
        const u1 = Math.max(rng(), 1e-9);
        const u2 = rng();
        const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const value = mean + gaussian * archetype.stdDev[dim];
        return Math.max(0, Math.round(value * 100) / 100);
      });
      profiles.push({ vector, archetype: archetype.name });
    }
  }

  return profiles;
}

/** A small helper exposed for tests that need raw jittered values without full profiles. */
export function jitter(base: number, spread: number, seed: number): number {
  const rng = mulberry32(seed);
  return randRange(rng, base - spread, base + spread);
}
