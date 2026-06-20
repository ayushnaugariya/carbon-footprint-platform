/**
 * Minimal, dependency-free k-means implementation.
 *
 * We implement this ourselves (rather than pulling in a heavy ML library)
 * because the feature vectors are tiny (5 dimensions) and a from-scratch
 * implementation keeps the dependency footprint and bundle size small while
 * remaining fully transparent and unit-testable.
 */

export type Vector = number[];

export interface KMeansResult {
  centroids: Vector[];
  assignments: number[];
  iterations: number;
}

function euclideanDistance(a: Vector, b: Vector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function meanVector(vectors: Vector[], dims: number): Vector {
  const mean = new Array(dims).fill(0);
  if (vectors.length === 0) return mean;
  for (const v of vectors) {
    for (let d = 0; d < dims; d++) mean[d] += v[d];
  }
  return mean.map((sum) => sum / vectors.length);
}

/**
 * Runs k-means clustering on a set of points.
 * Uses deterministic centroid initialization (evenly spaced sample picks)
 * so results are reproducible given the same input order.
 */
export function kmeans(points: Vector[], k: number, maxIterations = 50): KMeansResult {
  if (points.length === 0) {
    throw new Error('kmeans: points array must not be empty');
  }
  if (k <= 0 || k > points.length) {
    throw new Error('kmeans: k must be between 1 and number of points');
  }

  const dims = points[0].length;

  // Deterministic init: pick evenly-spaced points from the input as starting centroids.
  const step = Math.floor(points.length / k);
  let centroids: Vector[] = Array.from({ length: k }, (_, i) => [...points[i * step]]);

  const assignments = new Array(points.length).fill(-1);
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let changed = false;

    // Assignment step
    for (let p = 0; p < points.length; p++) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dist = euclideanDistance(points[p], centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
      if (assignments[p] !== bestCluster) {
        changed = true;
        assignments[p] = bestCluster;
      }
    }

    // Update step
    const newCentroids: Vector[] = [];
    for (let c = 0; c < k; c++) {
      const clusterPoints = points.filter((_, idx) => assignments[idx] === c);
      newCentroids.push(clusterPoints.length > 0 ? meanVector(clusterPoints, dims) : centroids[c]);
    }
    centroids = newCentroids;

    if (!changed) break;
  }

  return { centroids, assignments, iterations };
}

/** Assigns a single new point to the nearest existing centroid. Returns the cluster index. */
export function assignToNearestCentroid(point: Vector, centroids: Vector[]): number {
  let bestCluster = 0;
  let bestDist = Infinity;
  for (let c = 0; c < centroids.length; c++) {
    const dist = euclideanDistance(point, centroids[c]);
    if (dist < bestDist) {
      bestDist = dist;
      bestCluster = c;
    }
  }
  return bestCluster;
}
