"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  score: number;
}

function getLevelGradient(level: number): string {
  if (level >= 10) return "from-emerald-500 to-teal-400";
  if (level >= 7) return "from-green-500 to-emerald-400";
  if (level >= 5) return "from-lime-500 to-green-400";
  if (level >= 3) return "from-yellow-500 to-lime-400";
  return "from-amber-500 to-yellow-400";
}

function getLevelShadow(level: number): string {
  if (level >= 10) return "shadow-emerald-500/40";
  if (level >= 7) return "shadow-green-500/40";
  if (level >= 5) return "shadow-lime-500/40";
  if (level >= 3) return "shadow-yellow-500/40";
  return "shadow-amber-500/40";
}

function getScoreForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

const starContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const starVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export function LevelBadge({ level, score }: LevelBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const gradient = getLevelGradient(level);
  const shadow = getLevelShadow(level);
  const nextLevelScore = getScoreForNextLevel(level);
  const maxStars = Math.min(level, 5);
  const filledStars = Math.min(level, 5);
  const scoreToNext = Math.max(0, nextLevelScore - score);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={mounted ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r px-4 py-2 shadow-lg backdrop-blur-sm",
              gradient,
              shadow
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Lv
            </span>
            <span className="text-xl font-bold text-white">{level}</span>
            <motion.div
              className="flex items-center gap-0.5"
              variants={starContainerVariants}
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {Array.from({ length: maxStars }, (_, i) => (
                <motion.div key={i} variants={starVariants}>
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      i < filledStars
                        ? "fill-white text-white"
                        : "fill-transparent text-white/40"
                    )}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 text-white">
          <div className="space-y-1 text-center">
            <p className="text-xs font-medium">Level {level}</p>
            <p className="text-[10px] text-gray-400">
              {scoreToNext > 0
                ? `${scoreToNext} points to Level ${level + 1}`
                : "Max level reached!"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
