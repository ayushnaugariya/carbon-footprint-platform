import '@testing-library/jest-dom/vitest';

// jsdom does not implement ResizeObserver, but Recharts' ResponsiveContainer
// relies on it. A minimal no-op polyfill is enough for tests that only need
// to assert on rendered markup/labels, not real layout measurements.
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;
}

