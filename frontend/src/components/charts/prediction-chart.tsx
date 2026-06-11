"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCarbon } from "@/lib/utils";
import type { Prediction } from "@/types";

interface PredictionChartProps {
  predictions: Prediction[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number; payload: Prediction }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const pred = payload.find((p) => p.dataKey === "predicted_value");
  const upper = payload.find((p) => p.dataKey === "upper_bound");
  const lower = payload.find((p) => p.dataKey === "lower_bound");
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-emerald-400">
          Predicted: {pred ? formatCarbon(pred.value) : "—"}
        </p>
        <p className="text-xs text-cyan-400">
          Upper: {upper ? formatCarbon(upper.value) : "—"}
        </p>
        <p className="text-xs text-cyan-400">
          Lower: {lower ? formatCarbon(lower.value) : "—"}
        </p>
      </div>
    </div>
  );
}

export function PredictionChart({ predictions }: PredictionChartProps) {
  const formatted = predictions.map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Emission Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="boundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
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
                  dataKey="upper_bound"
                  stroke="none"
                  fill="url(#boundGradient)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound"
                  stroke="none"
                  fill="#111827"
                  fillOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#10b981",
                    stroke: "#065f46",
                    strokeWidth: 2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
