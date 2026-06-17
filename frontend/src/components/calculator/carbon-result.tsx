"use client";

import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Lightbulb,
  BarChart3,
  TreePine,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CarbonScore } from "@/types";

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; ring: string }
> = {
  excellent: {
    label: "Excellent",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-500/50",
  },
  good: {
    label: "Good",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    ring: "ring-blue-500/50",
  },
  average: {
    label: "Average",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    ring: "ring-yellow-500/50",
  },
  poor: {
    label: "Poor",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    ring: "ring-orange-500/50",
  },
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-500/15",
    ring: "ring-red-500/50",
  },
};

const FALLBACK_LEVEL = {
  label: "N/A",
  color: "text-green-400",
  bg: "bg-green-500/15",
  ring: "ring-green-500/50",
};

function normalizeLevel(level: unknown): string {
  if (typeof level !== "string") return "";
  const lower = level.toLowerCase().trim();
  if (lower === "below average") return "poor";
  if (lower === "needs improvement") return "critical";
  return lower;
}

function getLevelData(level: unknown) {
  const normalized = normalizeLevel(level);
  return LEVEL_CONFIG[normalized] ?? LEVEL_CONFIG["good"] ?? FALLBACK_LEVEL;
}

const SUGGESTION_ICONS = [TreePine, Lightbulb, TrendingDown, BarChart3];

interface CarbonResultProps {
  score: CarbonScore | null | undefined;
}

export function CarbonResult({ score }: CarbonResultProps) {
  const safeScore = score?.score ?? 0;
  const safeSuggestions = Array.isArray(score?.suggestions) ? score.suggestions : [];

  const levelData = getLevelData(score?.level);

  const nationalAverage = 4200;
  const comparison = nationalAverage - safeScore;
  const comparisonPercent = Math.abs(
    Math.round((comparison / nationalAverage) * 100)
  );

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const scoreVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Carbon Score</h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium ring-1",
            levelData.color,
            levelData.bg,
            levelData.ring
          )}
        >
          {levelData.label}
        </span>
      </motion.div>

      <motion.div
        variants={scoreVariants}
        className="flex flex-col items-center gap-2 py-4"
      >
        <span className={cn("text-6xl font-bold tabular-nums", levelData.color)}>
          {safeScore.toLocaleString()}
        </span>
        <span className="text-sm text-white/50">kg CO₂e per year</span>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3"
      >
        {comparison > 0 ? (
          <TrendingDown className="h-4 w-4 text-emerald-400" />
        ) : comparison < 0 ? (
          <TrendingUp className="h-4 w-4 text-red-400" />
        ) : (
          <Minus className="h-4 w-4 text-yellow-400" />
        )}
        <span className="text-sm text-white/70">
          {comparison > 0
            ? `${comparisonPercent}% below`
            : comparison < 0
              ? `${comparisonPercent}% above`
              : "Equal to"}{" "}
          national average ({nationalAverage.toLocaleString()} kg CO₂e)
        </span>
      </motion.div>

      {safeSuggestions.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-medium text-white/70">
            Suggestions to Reduce
          </h3>
          <ul className="space-y-2">
            {safeSuggestions.map((suggestion: string, index: number) => {
              const Icon =
                SUGGESTION_ICONS[index % SUGGESTION_ICONS.length];
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-start gap-3 rounded-lg bg-white/5 px-4 py-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-white/80">{suggestion}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
