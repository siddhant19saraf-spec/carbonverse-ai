"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCarbon } from "@/lib/utils";

interface EmissionTrendsProps {
  dailyTotals: { date: string; total: number }[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-emerald-400">
        {formatCarbon(payload[0].value)}
      </p>
    </div>
  );
}

export function EmissionTrends({ dailyTotals }: EmissionTrendsProps) {
  const safeTotals = Array.isArray(dailyTotals) ? dailyTotals : [];
  const formatted = safeTotals.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Emission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {formatted.length === 0 ? (
            <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
              No emissions data yet. Record some emissions to see trends.
            </div>
          ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="emissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="label"
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
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#emissionGradient)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#10b981",
                    stroke: "#065f46",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
