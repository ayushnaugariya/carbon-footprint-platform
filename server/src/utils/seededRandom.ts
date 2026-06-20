/**
 * Mulberry32 - a small, fast, deterministic pseudo-random number generator.
 * We use a seeded PRNG (instead of Math.random) so that the synthetic
 * comparison dataset used by the ML insights layer is reproducible across
 * server restarts and identical across test runs.
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a random float in [min, max) using the provided RNG function. */
export function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Returns a random integer in [min, max] inclusive using the provided RNG function. */
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1));
}
