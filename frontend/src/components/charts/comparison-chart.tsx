"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCarbon, cn } from "@/lib/utils";
import type { NationalComparison } from "@/types";

interface ComparisonChartProps {
  comparison: NationalComparison;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-300">{item.name}:</span>
            <span className="text-xs font-semibold" style={{ color: item.color }}>
              {formatCarbon(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: TooltipPayloadItem[] }) {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-6 pt-2">
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-400">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonChart({ comparison }: ComparisonChartProps) {
  const breakdownEntries = Object.entries(comparison.breakdown ?? {});

  const chartData = [
    { name: "Total", user: comparison.user_total, national: comparison.national_total },
    ...breakdownEntries.map(([cat, data]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      user: data.user,
      national: data.national,
    })),
  ];

  const diffPct = comparison.difference_pct ?? 0;
  const isLower = diffPct < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">National Comparison</CardTitle>
            <div
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                isLower
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              )}
            >
              {isLower ? "↓" : "↑"} {Math.abs(diffPct).toFixed(1)}% {isLower ? "below" : "above"} average
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(v: number) => formatCarbon(v)}
                  dx={-8}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend content={<CustomLegend />} />
                <Bar
                  dataKey="user"
                  name="Your Emissions"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="national"
                  name="National Average"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
