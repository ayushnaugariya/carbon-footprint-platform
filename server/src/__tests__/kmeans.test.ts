import { assignToNearestCentroid, kmeans } from '../services/kmeans';

describe('kmeans', () => {
  it('throws on empty input', () => {
    expect(() => kmeans([], 2)).toThrow();
  });

  it('throws when k exceeds the number of points', () => {
    expect(() => kmeans([[1, 1]], 5)).toThrow();
  });

  it('separates two obviously distinct clusters correctly', () => {
    const points = [
      [0, 0], [1, 0], [0, 1], [1, 1], // cluster A near origin
      [100, 100], [101, 100], [100, 101], [101, 101] // cluster B far away
    ];

    const { centroids, assignments } = kmeans(points, 2);

    expect(centroids).toHaveLength(2);
    // All points in cluster A should share one assignment, all in cluster B another.
    const clusterAAssignments = new Set(assignments.slice(0, 4));
    const clusterBAssignments = new Set(assignments.slice(4));
    expect(clusterAAssignments.size).toBe(1);
    expect(clusterBAssignments.size).toBe(1);
    expect([...clusterAAssignments][0]).not.toBe([...clusterBAssignments][0]);
  });

  it('converges within the iteration cap', () => {
    const points = Array.from({ length: 20 }, (_, i) => [i, i % 5]);
    const { iterations } = kmeans(points, 3, 50);
    expect(iterations).toBeLessThanOrEqual(50);
    expect(iterations).toBeGreaterThan(0);
  });

  describe('assignToNearestCentroid', () => {
    it('assigns a point to its closest centroid', () => {
      const centroids = [[0, 0], [10, 10]];
      expect(assignToNearestCentroid([1, 1], centroids)).toBe(0);
      expect(assignToNearestCentroid([9, 9], centroids)).toBe(1);
    });
  });
});
