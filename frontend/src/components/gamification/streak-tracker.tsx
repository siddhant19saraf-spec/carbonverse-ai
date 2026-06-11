"use client";

import { motion } from "framer-motion";
import { Flame, PartyPopper, Trophy, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakTrackerProps {
  streakDays: number;
}

const MILESTONES = [
  { days: 30, label: "30 Day Streak!", icon: Trophy, color: "text-yellow-400" },
  { days: 14, label: "2 Week Warrior!", icon: Award, color: "text-purple-400" },
  { days: 7, label: "Week Champion!", icon: PartyPopper, color: "text-blue-400" },
] as const;

function getMilestone(streakDays: number) {
  return MILESTONES.find((m) => m.days <= streakDays) || null;
}

function getFireColor(streakDays: number): string {
  if (streakDays >= 30) return "text-orange-500";
  if (streakDays >= 14) return "text-orange-400";
  if (streakDays >= 7) return "text-amber-400";
  return "text-amber-300";
}

function getLast7Days(streakDays: number): { active: boolean; label: string }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
    return {
      active: i < streakDays || (streakDays >= 7 && i < 7),
      label: dayLabel,
    };
  });
}

export function StreakTracker({ streakDays }: StreakTrackerProps) {
  const fireColor = getFireColor(streakDays);
  const milestone = getMilestone(streakDays);
  const last7Days = getLast7Days(streakDays);
  const MilestoneIcon = milestone?.icon;

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1, 1.2, 1],
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Flame className={cn("h-8 w-8", fireColor)} />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-white">{streakDays}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {last7Days.map((day, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  aria-label={`Day ${i + 1}: ${day.active ? "tracked" : "not tracked"}`}
                  className={cn(
                    "h-3 w-3 rounded-full transition-colors",
                    day.active
                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                      : "bg-gray-700"
                  )}
                />
                <span className="text-[9px] text-muted-foreground">{day.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {milestone && MilestoneIcon && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <MilestoneIcon className={cn("h-4 w-4", milestone.color)} />
            <span className="text-xs font-medium text-white/90">{milestone.label}</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
