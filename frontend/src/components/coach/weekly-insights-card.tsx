"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Trophy,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface WeeklyInsights {
  summary: string;
  totalEmissions: number;
  previousWeekEmissions: number;
  achievements: string[];
  improvements: string[];
  goals: string[];
}

export function WeeklyInsightsCard() {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get<WeeklyInsights>("/coach/weekly-insights");
        setInsights(response);
      } catch {
        setError("Failed to load weekly insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const weeklyChange =
    insights
      ? insights.totalEmissions - insights.previousWeekEmissions
      : 0;
  const weeklyChangePercent = insights?.previousWeekEmissions
    ? Math.abs(Math.round((weeklyChange / insights.previousWeekEmissions) * 100))
    : 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

      <motion.div
        variants={itemVariants}
        className="relative flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
            <CalendarDays className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white/90">
            Weekly Insights
          </h3>
        </div>
        {insights && (
          <div className="flex items-center gap-1.5">
            {weeklyChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            ) : weeklyChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-400" />
            ) : (
              <Minus className="h-4 w-4 text-yellow-400" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                weeklyChange < 0
                  ? "text-emerald-400"
                  : weeklyChange > 0
                    ? "text-red-400"
                    : "text-yellow-400"
              )}
            >
              {weeklyChange <= 0 ? "-" : "+"}
              {weeklyChangePercent}%
            </span>
          </div>
        )}
      </motion.div>

      <div className="relative mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-white/40">
            {error}
          </div>
        ) : insights ? (
          <div className="space-y-5">
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40">This week total</p>
                  <p className="text-lg font-semibold text-white">
                    {insights.totalEmissions.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-white/50">
                      kg CO₂e
                    </span>
                  </p>
                </div>
              </div>
              <p className="mt-2 px-1 text-xs leading-relaxed text-white/50">
                {insights.summary}
              </p>
            </motion.div>

            {insights.achievements.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                  <h4 className="text-xs font-medium text-yellow-400">
                    Achievements
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {insights.achievements.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-start gap-2 rounded-lg bg-yellow-500/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span className="mt-0.5 text-yellow-400">&#10003;</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {insights.improvements.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                  <h4 className="text-xs font-medium text-orange-400">
                    Areas to Improve
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {insights.improvements.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-start gap-2 rounded-lg bg-orange-500/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span className="mt-0.5 text-orange-400">&#8593;</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {insights.goals.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-emerald-400" />
                  <h4 className="text-xs font-medium text-emerald-400">
                    Next Week Goals
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {insights.goals.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-start gap-2 rounded-lg bg-emerald-500/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span className="mt-0.5 text-emerald-400">&#9679;</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
