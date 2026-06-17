"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Achievement, UserAchievement } from "@/types";

interface AchievementsGridProps {
  token?: string;
}

const BADGE_EMOJIS: Record<string, string> = {
  transportation: "🚲",
  energy: "⚡",
  water: "💧",
  waste: "♻️",
  food: "🥗",
  general: "🌍",
  streak: "🔥",
  challenge: "🏆",
  emission: "🌱",
  community: "👥",
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
};

export function AchievementsGrid({ token }: AchievementsGridProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allAchievements, userAchievements] = await Promise.all([
        api.get<Achievement[]>("/achievements/", token),
        api.get<UserAchievement[]>("/achievements/me", token),
      ]);
      setAchievements(allAchievements);
        setUnlockedIds(new Set(userAchievements.map((ua) => ua.achievement?.id).filter(Boolean)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load achievements";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={200}>
          <motion.div
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
            role="grid"
            aria-label="Achievement badges"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {achievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const emoji = BADGE_EMOJIS[achievement.category] || "🏅";

              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                        isUnlocked
                          ? "border-amber-500/30 bg-amber-500/10 shadow-sm shadow-amber-500/10"
                          : "border-white/10 bg-white/5 opacity-50 grayscale"
                      )}
                    >
                      {isUnlocked && (
                        <motion.div
                          className="absolute -right-1 -top-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                        </motion.div>
                      )}

                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                        {isUnlocked ? (
                          <span>{emoji}</span>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <span className="w-full truncate text-center text-[10px] font-medium text-white/80">
                        {achievement.name}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px] bg-gray-900 text-white">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{achievement.name}</p>
                      <p className="text-[10px] text-gray-400">{achievement.description}</p>
                      {!isUnlocked && (
                        <p className="text-[10px] text-red-400">Locked</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
