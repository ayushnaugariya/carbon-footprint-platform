import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryBreakdown } from '../types';

const CATEGORY_META: { key: keyof Pick<CategoryBreakdown, 'transport' | 'home' | 'diet' | 'consumption' | 'waste'>; label: string; color: string }[] = [
  { key: 'transport', label: 'Transport', color: '#2563eb' },
  { key: 'home', label: 'Home energy', color: '#c97a1a' },
  { key: 'diet', label: 'Diet', color: '#3d9639' },
  { key: 'consumption', label: 'Shopping', color: '#7c3aed' },
  { key: 'waste', label: 'Waste', color: '#64748b' }
];

export function BreakdownChart({ breakdown }: { breakdown: CategoryBreakdown }) {
  const data = CATEGORY_META.map((meta) => ({ name: meta.label, value: Math.round(breakdown[meta.key] * 10) / 10, color: meta.color }));
  const summary = data.map((d) => `${d.name}: ${d.value} kg CO2e per week`).join(', ');

  return (
    <div>
      <div role="img" aria-label={`Weekly footprint by category. ${summary}.`} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} label={{ value: 'kg CO2e / week', position: 'insideBottom', offset: -4, fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13 }} />
            <Tooltip formatter={(value) => [`${value} kg CO2e`, 'per week']} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen-reader-friendly equivalent of the chart above. */}
      <table className="sr-only">
        <caption>Weekly carbon footprint by category, in kilograms of CO2 equivalent</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">kg CO2e per week</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <th scope="row">{d.name}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
