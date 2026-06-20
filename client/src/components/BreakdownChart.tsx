import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryBreakdown } from '../types';

const CATEGORY_META: { key: keyof Pick<CategoryBreakdown, 'transport' | 'home' | 'diet' | 'consumption' | 'waste'>; label: string; color: string; gradId: string }[] = [
  { key: 'transport', label: 'Transport', color: '#3b82f6', gradId: 'grad-transport' },
  { key: 'home', label: 'Home energy', color: '#f59e0b', gradId: 'grad-home' },
  { key: 'diet', label: 'Diet', color: '#10b981', gradId: 'grad-diet' },
  { key: 'consumption', label: 'Shopping', color: '#8b5cf6', gradId: 'grad-consumption' },
  { key: 'waste', label: 'Waste', color: '#64748b', gradId: 'grad-waste' }
];

export function BreakdownChart({ breakdown }: { breakdown: CategoryBreakdown }) {
  const data = CATEGORY_META.map((meta) => ({
    name: meta.label,
    value: Math.round(breakdown[meta.key] * 10) / 10,
    color: meta.color,
    gradId: meta.gradId
  }));
  const summary = data.map((d) => `${d.name}: ${d.value} kg CO2e per week`).join(', ');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white shadow-xl">
          <p className="font-bold text-slate-100">{payload[0].name}</p>
          <p className="mt-1 text-brand-300 font-semibold">{payload[0].value} kg CO2e / week</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div role="img" aria-label={`Weekly footprint by category. ${summary}.`} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16, top: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="grad-transport" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="grad-home" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="grad-diet" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="grad-consumption" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="grad-waste" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#475569" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'kg CO2e / week', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }} 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100} 
              tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={`url(#${entry.gradId})`} />
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
