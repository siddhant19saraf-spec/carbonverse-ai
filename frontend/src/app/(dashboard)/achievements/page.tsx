"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { LevelBadge } from "@/components/gamification/level-badge";
import { StreakTracker } from "@/components/gamification/streak-tracker";
import { ChallengesList } from "@/components/gamification/challenges-list";
import { AchievementsGrid } from "@/components/gamification/achievements-grid";
import type { GamificationState } from "@/types";

export default function AchievementsPage() {
  const { tokens } = useAuthContext();
  const [state, setState] = useState<GamificationState | null>(null);

  useEffect(() => {
    if (!tokens) return;
    api.get<GamificationState>("/achievements/state", tokens.access_token)
      .then(setState)
      .catch(console.error);
  }, [tokens]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {state && (
          <>
            <LevelBadge level={state.green_level} score={state.current_score} />
            <StreakTracker streakDays={state.streak_days} />
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekly Progress</h3>
              <p className="text-3xl font-bold">{state.weekly_progress}%</p>
              <div className="w-full h-2 rounded-full bg-muted mt-3">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${state.weekly_progress}%` }} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChallengesList />
        <AchievementsGrid />
      </div>
    </motion.div>
  );
}
