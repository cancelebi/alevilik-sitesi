'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminChartProps {
  data: { name: string; makale: number; forum: number }[];
}

export default function AdminChart({ data }: AdminChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm w-full h-[350px]">
      <h3 className="text-lg font-serif text-dark mb-6">Kategorilere Göre İçerik Dağılımı</h3>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Bar dataKey="makale" name="Makale" fill="#8b2c2c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="forum" name="Forum" fill="#c08457" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
