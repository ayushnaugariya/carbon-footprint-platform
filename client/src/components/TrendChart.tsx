import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FootprintEntry } from '../types';

export function TrendChart({ entries }: { entries: FootprintEntry[] }) {
  const data = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    total: Math.round(e.total_weekly * 10) / 10
  }));

  const summary = data.map((d) => `${d.date}: ${d.total} kg`).join(', ');

  return (
    <div>
      <div role="img" aria-label={`Weekly footprint total over time. ${summary}.`} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'kg CO2e / week', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value} kg CO2e`, 'Weekly total']} />
            <Line type="monotone" dataKey="total" stroke="#2d7a2a" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Weekly carbon footprint total over time, in kilograms of CO2 equivalent</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Total kg CO2e</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, idx) => (
            <tr key={`${d.date}-${idx}`}>
              <th scope="row">{d.date}</th>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
