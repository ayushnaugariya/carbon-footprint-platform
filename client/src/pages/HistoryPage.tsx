import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendChart } from '../components/TrendChart';
import * as api from '../lib/api';
import type { FootprintEntry } from '../types';

interface EntryWithTrend extends FootprintEntry {
  changeText: string;
  changeType: 'down' | 'up' | 'none' | 'initial';
}

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

  // Compute trend metrics relative to previous entries
  const entriesWithTrends: EntryWithTrend[] = entries.map((e, idx) => {
    const prevEntry = idx > 0 ? entries[idx - 1] : null;
    let changeText = '';
    let changeType: 'down' | 'up' | 'none' | 'initial' = 'initial';

    if (prevEntry) {
      const diff = e.total_weekly - prevEntry.total_weekly;
      const pct = prevEntry.total_weekly > 0 ? Math.round((diff / prevEntry.total_weekly) * 100) : 0;
      
      if (diff < -0.1) {
        changeType = 'down';
        changeText = `-${Math.abs(diff).toFixed(1)} kg (-${Math.abs(pct)}%)`;
      } else if (diff > 0.1) {
        changeType = 'up';
        changeText = `+${diff.toFixed(1)} kg (+${pct}%)`;
      } else {
        changeType = 'none';
        changeText = '0.0 kg (0%)';
      }
    } else {
      changeText = 'Baseline';
    }

    return { ...e, changeText, changeType };
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" role="status" aria-live="polite">
        <svg className="h-10 w-10 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-ink-500 font-medium text-sm">Loading your footprint history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700 font-medium flex items-center gap-3">
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center max-w-xl mx-auto my-8 border-dashed border-2">
        <div className="p-4 bg-brand-50 rounded-full text-brand-600 mb-5">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-ink-900 tracking-tight">No history yet</h1>
        <p className="mt-3 text-ink-700 text-sm max-w-sm">Track your footprint a few times to start compiling your history and linear regression projections.</p>
        <Link to="/track" className="mt-6 rounded-xl bg-brand-700 px-6 py-3 font-bold text-white shadow-md shadow-brand-200 transition-colors hover:bg-brand-800 text-sm">
          Track my footprint
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 no-print">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink-900">Your History</h1>
          <p className="text-sm text-ink-700 mt-0.5">Compare weekly logs, review trends, and export records.</p>
        </div>
        <button
          onClick={handlePrint}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Printed Header (only visible when printing) */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-emerald-800">GreenTrack Weekly Footprint Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Chart Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200/50">
        <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">Weekly total over time</h2>
        <TrendChart entries={entries} />
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="sr-only">All tracked footprint entries</caption>
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-ink-500">
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Date</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Transport</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Home</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Diet</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Shopping</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Waste</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Total / week</th>
              <th scope="col" className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Weekly change</th>
            </tr>
          </thead>
          <tbody>
            {entriesWithTrends
              .slice()
              .reverse()
              .map((e) => (
                <tr key={e.id} className="border-b border-slate-100/50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink-700">
                    {new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-ink-500">{e.transport.toFixed(1)}</td>
                  <td className="px-5 py-4 text-ink-500">{e.home.toFixed(1)}</td>
                  <td className="px-5 py-4 text-ink-500">{e.diet.toFixed(1)}</td>
                  <td className="px-5 py-4 text-ink-500">{e.consumption.toFixed(1)}</td>
                  <td className="px-5 py-4 text-ink-500">{e.waste.toFixed(1)}</td>
                  <td className="px-5 py-4 font-extrabold text-ink-900">{e.total_weekly.toFixed(1)} kg</td>
                  <td className="px-5 py-4 font-medium text-xs">
                    {e.changeType === 'down' ? (
                      <span className="flex items-center gap-1 text-emerald-600" title="Footprint decreased">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                        </svg>
                        {e.changeText}
                      </span>
                    ) : e.changeType === 'up' ? (
                      <span className="flex items-center gap-1 text-rose-600" title="Footprint increased">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                        </svg>
                        {e.changeText}
                      </span>
                    ) : e.changeType === 'none' ? (
                      <span className="text-slate-400 font-medium" title="Stable footprint">
                        Stable ({e.changeText})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded-md">
                        {e.changeText}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
