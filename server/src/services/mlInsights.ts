import { kmeans, assignToNearestCentroid, Vector } from './kmeans';
import { fitLinearRegression, predict, RegressionModel } from './linearRegression';
import { CATEGORY_DIMENSIONS, CategoryDimension, generateSyntheticDataset } from './syntheticDataset';

export interface PersonaInfo {
  id: string;
  title: string;
  focus: CategoryDimension;
  description: string;
}

const PERSONA_BY_DIMENSION: Record<CategoryDimension, PersonaInfo> = {
  transport: {
    id: 'commuter-heavy',
    title: 'The Commuter',
    focus: 'transport',
    description: 'Most of your footprint comes from how you get around. Small changes to daily travel will have an outsized impact for you.'
  },
  home: {
    id: 'home-energy-heavy',
    title: 'The Home Energy User',
    focus: 'home',
    description: 'Home energy use is your biggest lever. Heating, cooling, and electricity choices matter more for you than for most.'
  },
  diet: {
    id: 'diet-heavy',
    title: 'The Diet-Driven',
    focus: 'diet',
    description: 'Food choices make up a large share of your footprint, so shifting what is on your plate offers the biggest wins.'
  },
  consumption: {
    id: 'consumption-heavy',
    title: 'The Consumer',
    focus: 'consumption',
    description: 'Shopping and goods consumption stand out in your profile. Buying less and buying smarter will move the needle most.'
  },
  waste: {
    id: 'waste-heavy',
    title: 'The Waste-Conscious',
    focus: 'waste',
    description: 'Waste handling is a notable share of your impact. Diverting more waste from landfill will help disproportionately.'
  }
};

interface MLModel {
  centroids: Vector[];
  centroidPersona: PersonaInfo[];
  datasetTotals: number[]; // sum of all categories per synthetic profile, for percentile scoring
}

let cachedModel: MLModel | null = null;

/**
 * Builds (or returns the cached) clustering model. Building means:
 *  1. Generate the deterministic synthetic population.
 *  2. Run k-means (k = number of category dimensions) to find centroids.
 *  3. Label each centroid with the persona whose focus dimension is most
 *     dominant relative to the dataset-wide average for that dimension.
 */
function getModel(): MLModel {
  if (cachedModel) return cachedModel;

  const profiles = generateSyntheticDataset();
  const vectors = profiles.map((p) => p.vector);
  const k = CATEGORY_DIMENSIONS.length;
  const { centroids } = kmeans(vectors, k);

  const dims = CATEGORY_DIMENSIONS.length;
  const overallMean = new Array(dims).fill(0);
  for (const v of vectors) {
    for (let d = 0; d < dims; d++) overallMean[d] += v[d];
  }
  for (let d = 0; d < dims; d++) overallMean[d] /= vectors.length;

  const centroidPersona = centroids.map((centroid) => {
    // Find which dimension this centroid exceeds the overall mean by the
    // largest relative margin - that becomes its dominant/defining trait.
    let bestDim = 0;
    let bestRatio = -Infinity;
    for (let d = 0; d < dims; d++) {
      const ratio = overallMean[d] === 0 ? 0 : centroid[d] / overallMean[d];
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestDim = d;
      }
    }
    return PERSONA_BY_DIMENSION[CATEGORY_DIMENSIONS[bestDim]];
  });

  const datasetTotals = vectors.map((v) => v.reduce((a, b) => a + b, 0)).sort((a, b) => a - b);

  cachedModel = { centroids, centroidPersona, datasetTotals };
  return cachedModel;
}

/** Resets the cached model. Exposed only for test isolation. */
export function __resetModelCacheForTests(): void {
  cachedModel = null;
}

export interface CategoryBreakdown {
  transport: number;
  home: number;
  diet: number;
  consumption: number;
  waste: number;
}

function breakdownToVector(breakdown: CategoryBreakdown): Vector {
  return CATEGORY_DIMENSIONS.map((dim) => breakdown[dim]);
}

/** Determines which lifestyle persona a user's weekly category breakdown is closest to. */
export function detectPersona(breakdown: CategoryBreakdown): PersonaInfo {
  const model = getModel();
  const vector = breakdownToVector(breakdown);
  const clusterIdx = assignToNearestCentroid(vector, model.centroids);
  return model.centroidPersona[clusterIdx];
}

/**
 * Returns the user's percentile (0-100) relative to the synthetic comparison
 * population, where a LOWER percentile means a LOWER (better) footprint than
 * most of the comparison population.
 */
export function computePercentile(weeklyTotal: number): number {
  const model = getModel();
  const totals = model.datasetTotals;
  let countBelow = 0;
  for (const t of totals) {
    if (t <= weeklyTotal) countBelow++;
  }
  return Math.round((countBelow / totals.length) * 100);
}

export interface TrendPoint {
  /** Days since the user's first tracked entry. */
  daysSinceStart: number;
  totalKgCo2e: number;
}

export interface TrendResult {
  available: boolean;
  reason?: string;
  model?: RegressionModel;
  projectedIn30Days?: number;
  percentChangeProjected?: number;
}

/**
 * Fits a simple linear trend to a user's historical footprint entries and
 * projects 30 days forward. Requires at least 3 data points to be considered
 * meaningful; otherwise returns available: false with a reason.
 */
export function computeTrend(points: TrendPoint[]): TrendResult {
  if (points.length < 3) {
    return { available: false, reason: 'Not enough tracked history yet (need at least 3 entries).' };
  }

  const xs = points.map((p) => p.daysSinceStart);
  const ys = points.map((p) => p.totalKgCo2e);
  const model = fitLinearRegression(xs, ys);

  const lastDay = xs[xs.length - 1];
  const lastValue = ys[ys.length - 1];
  const projectedIn30Days = Math.max(0, predict(model, lastDay + 30));
  const percentChangeProjected = lastValue === 0 ? 0 : ((projectedIn30Days - lastValue) / lastValue) * 100;

  return {
    available: true,
    model,
    projectedIn30Days: Math.round(projectedIn30Days * 100) / 100,
    percentChangeProjected: Math.round(percentChangeProjected * 10) / 10
  };
}
