import { fitLinearRegression, predict } from '../services/linearRegression';

describe('linearRegression', () => {
  it('throws when fewer than 2 points are provided', () => {
    expect(() => fitLinearRegression([1], [1])).toThrow();
  });

  it('throws when x and y arrays have mismatched lengths', () => {
    expect(() => fitLinearRegression([1, 2, 3], [1, 2])).toThrow();
  });

  it('fits a perfect line exactly (y = 2x + 1)', () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = xs.map((x) => 2 * x + 1);
    const model = fitLinearRegression(xs, ys);

    expect(model.slope).toBeCloseTo(2, 5);
    expect(model.intercept).toBeCloseTo(1, 5);
    expect(model.rSquared).toBeCloseTo(1, 5);
  });

  it('predicts correctly using a fitted model', () => {
    const model = fitLinearRegression([0, 1, 2], [1, 3, 5]); // y = 2x + 1
    expect(predict(model, 10)).toBeCloseTo(21, 5);
  });

  it('returns a low R^2 for noisy/unrelated data', () => {
    const xs = [0, 1, 2, 3, 4, 5];
    const ys = [5, 1, 8, 2, 9, 0];
    const model = fitLinearRegression(xs, ys);
    expect(model.rSquared).toBeLessThan(0.5);
  });
});
