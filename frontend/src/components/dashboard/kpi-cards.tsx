"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingDown, TrendingUp, Leaf, Calendar, BarChart3, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCarbon, getScoreColor } from "@/lib/utils";
import type { EmissionSummary, CarbonScore } from "@/types";

interface KpiCardsProps {
  summary: EmissionSummary;
  score: CarbonScore;
}

interface AnimatedCounterProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

function AnimatedCounter({ value, format = formatCarbon, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    let animationFrame: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}

const kpiDefinitions = [
  {
    key: "total" as const,
    label: "Total Emissions",
    icon: Target,
    getValue: (s: EmissionSummary) => s.total_carbon,
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
  },
  {
    key: "daily" as const,
    label: "Daily Average",
    icon: Calendar,
    getValue: (s: EmissionSummary) => s.daily_average,
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    key: "weekly" as const,
    label: "Weekly Total",
    icon: BarChart3,
    getValue: (s: EmissionSummary) => s.weekly_total,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    key: "monthly" as const,
    label: "Monthly Total",
    icon: Leaf,
    getValue: (s: EmissionSummary) => s.monthly_total,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function KpiCards({ summary, score }: KpiCardsProps) {
  const trendPositive = (score?.score ?? 0) >= 50;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiDefinitions.map((kpi, i) => {
        const Icon = kpi.icon;
        const value = kpi.getValue(summary);
        return (
          <motion.div
            key={kpi.key}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              className={cn(
                "relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-md",
                kpi.color,
                "border border-white/10 shadow-lg shadow-black/5"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {kpi.label}
                    </p>
                    <AnimatedCounter
                      value={value}
                      className="text-2xl font-bold tracking-tight"
                    />
                    <div className="flex items-center gap-1 text-xs">
                      {trendPositive ? (
                        <TrendingDown className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-rose-500" />
                      )}
                      <span
                        className={cn(
                          trendPositive ? "text-emerald-500" : "text-rose-500"
                        )}
                      >
                        {trendPositive ? "Trending down" : "Trending up"}
                      </span>
                      <span className="text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <div className={cn("rounded-xl bg-white/10 p-2.5", kpi.iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
