"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_INK, RELEVANCE_COLORS } from "@/lib/colors";
import type { Relevance } from "@/lib/types";

const tickStyle = { fontSize: 11 };
const tooltipStyle = {
  background: CHART_INK.surface,
  border: `1px solid ${CHART_INK.grid}`,
  borderRadius: 8,
  fontSize: 12,
  color: CHART_INK.primary,
};

export function CountBarChart({
  data,
  hue,
  maxItems = 15,
}: {
  data: { name: string; count: number }[];
  hue: string;
  maxItems?: number;
}) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, maxItems);
  const height = Math.max(120, sorted.length * 30);

  if (sorted.length === 0) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ ...tickStyle, fill: CHART_INK.muted }}
          axisLine={{ stroke: CHART_INK.baseline }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={190}
          tick={{ ...tickStyle, fill: CHART_INK.secondary }}
          axisLine={{ stroke: CHART_INK.baseline }}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill={hue} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RelevanceBarChart({ data }: { data: { name: Relevance; count: number }[] }) {
  if (data.every((d) => d.count === 0)) return <EmptyState />;
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ ...tickStyle, fill: CHART_INK.muted }}
          axisLine={{ stroke: CHART_INK.baseline }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={70}
          tick={{ fontSize: 12, fill: CHART_INK.secondary }}
          axisLine={{ stroke: CHART_INK.baseline }}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((d) => (
            <Cell key={d.name} fill={RELEVANCE_COLORS[d.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[120px] items-center justify-center text-sm text-[var(--ink-muted)]">
      No data yet
    </div>
  );
}
