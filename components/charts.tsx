"use client";

import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SectionRadar({ data }: { data: Array<{ title: string; score: number }> }) {
  return (
    <div className="h-80">
      <ResponsiveContainer>
        <RadarChart data={data.map((d) => ({ ...d, label: d.title.slice(0, 18) }))}>
          <PolarGrid />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
          <Radar dataKey="score" fill="#2563eb" fillOpacity={0.25} stroke="#2563eb" />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskBar({ data }: { data: Array<{ title: string; riskScore: number }> }) {
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data.map((d) => ({ ...d, label: d.title.slice(0, 32) }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="riskScore" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
