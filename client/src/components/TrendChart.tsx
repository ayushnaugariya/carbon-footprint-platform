import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FootprintEntry } from '../types';

export function TrendChart({ entries }: { entries: FootprintEntry[] }) {
  const data = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    total: Math.round(e.total_weekly * 10) / 10
  }));

  const summary = data.map((d) => `${d.date}: ${d.total} kg`).join(', ');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white shadow-xl">
          <p className="font-bold text-slate-300">{payload[0].payload.date}</p>
          <p className="mt-1 text-brand-300 font-semibold">{payload[0].value} kg CO2e / week</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div role="img" aria-label={`Weekly footprint total over time. ${summary}.`} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'kg CO2e / week', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b', style: { textAnchor: 'middle' } }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorTotal)" 
              dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
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
