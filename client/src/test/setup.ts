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

// Polyfill window.localStorage for JSDOM test environment
if (typeof window !== 'undefined') {
  let store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem(key: string): string | null {
      return store[key] !== undefined ? store[key] : null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      return Object.keys(store)[index] || null;
    }
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
    enumerable: true,
    writable: true
  });
}

