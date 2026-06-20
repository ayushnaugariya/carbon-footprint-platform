import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendChart } from '../components/TrendChart';
import * as api from '../lib/api';
import type { FootprintEntry } from '../types';

export function HistoryPage() {
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getFootprintHistory()
      .then((res) => setEntries(res.entries))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load history'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <p role="status" aria-live="polite" className="py-16 text-center text-ink-500">
        Loading your history&hellip;
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-ink-900">No history yet</h1>
        <p className="mt-2 text-ink-700">Track your footprint a few times to see your trend over time.</p>
        <Link to="/track" className="mt-6 inline-block rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-800">
          Track my footprint
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink-900">Your history</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink-900">Weekly total over time</h2>
        <div className="mt-4">
          <TrendChart entries={entries} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All tracked footprint entries</caption>
          <thead className="bg-gray-50 text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">Transport</th>
              <th scope="col" className="px-4 py-3 font-medium">Home</th>
              <th scope="col" className="px-4 py-3 font-medium">Diet</th>
              <th scope="col" className="px-4 py-3 font-medium">Shopping</th>
              <th scope="col" className="px-4 py-3 font-medium">Waste</th>
              <th scope="col" className="px-4 py-3 font-medium">Total / week</th>
            </tr>
          </thead>
          <tbody>
            {entries
              .slice()
              .reverse()
              .map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{e.transport.toFixed(1)}</td>
                  <td className="px-4 py-3">{e.home.toFixed(1)}</td>
                  <td className="px-4 py-3">{e.diet.toFixed(1)}</td>
                  <td className="px-4 py-3">{e.consumption.toFixed(1)}</td>
                  <td className="px-4 py-3">{e.waste.toFixed(1)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{e.total_weekly.toFixed(1)} kg</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
