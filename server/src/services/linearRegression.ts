/**
 * Ordinary least-squares simple linear regression (one predictor variable).
 * Used to project a user's footprint trend from their tracked history.
 */

export interface RegressionModel {
  slope: number;
  intercept: number;
  /** R^2 goodness-of-fit, 0-1. Low values mean the trend line is not reliable. */
  rSquared: number;
}

export function fitLinearRegression(xs: number[], ys: number[]): RegressionModel {
  if (xs.length !== ys.length || xs.length < 2) {
    throw new Error('fitLinearRegression: need at least 2 matching x/y points');
  }

  const n = xs.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (ys[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // R^2
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * xs[i] + intercept;
    ssRes += (ys[i] - predicted) ** 2;
    ssTot += (ys[i] - yMean) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, rSquared };
}

export function predict(model: RegressionModel, x: number): number {
  return model.slope * x + model.intercept;
}
