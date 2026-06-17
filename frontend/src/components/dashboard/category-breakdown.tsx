"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryColor, getCategoryIcon, cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  breakdown: Record<string, number>;
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  category: string;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-base">{getCategoryIcon(item.name)}</span>
        <span className="text-sm font-medium capitalize text-white">{item.name}</span>
      </div>
      <p className="mt-1 text-sm font-semibold" style={{ color: getCategoryColor(item.name) }}>
        {item.value.toFixed(1)} kg CO₂
      </p>
    </div>
  );
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  const safeBreakdown = breakdown ?? {};
  const data = Object.entries(safeBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const categories = Object.keys(safeBreakdown);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No emissions data yet. Record some emissions to see a breakdown.
            </div>
          ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="h-[260px] w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={getCategoryColor(entry.name)}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium"
                >
                  <span>{getCategoryIcon(cat)}</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  <span className="capitalize text-gray-300">{cat}</span>
                </div>
              ))}
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
