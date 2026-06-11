"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  Award,
  Trophy,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AdminUserAnalytics, AdminPlatformMetrics } from "@/types";

interface AnalyticsCardsProps {
  token?: string;
}

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  className?: string;
}

function AnimatedCounter({ value, decimals = 0, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let animationFrame: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function AnalyticsCards({ token }: AnalyticsCardsProps) {
  const [userAnalytics, setUserAnalytics] = useState<AdminUserAnalytics | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<AdminPlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [users, metrics] = await Promise.all([
        api.get<AdminUserAnalytics>("/admin/user-analytics", token),
        api.get<AdminPlatformMetrics>("/admin/platform-metrics", token),
      ]);
      setUserAnalytics(users);
      setPlatformMetrics(metrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card
            key={i}
            className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md"
          >
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: userAnalytics?.total_users ?? 0,
      icon: Users,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Active Users",
      value: userAnalytics?.active_users ?? 0,
      icon: UserCheck,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      label: "Total Emissions",
      value: platformMetrics?.total_emissions_recorded ?? 0,
      icon: Activity,
      gradient: "from-rose-500/20 to-rose-600/5",
      iconColor: "text-rose-400",
    },
    {
      label: "Avg Score",
      value: platformMetrics?.avg_sustainability_score ?? 0,
      decimals: 1,
      icon: TrendingUp,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
    },
    {
      label: "Achievements Unlocked",
      value: platformMetrics?.total_achievements_unlocked ?? 0,
      icon: Award,
      gradient: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
    },
    {
      label: "Challenges Completed",
      value: platformMetrics?.total_challenges_completed ?? 0,
      icon: Trophy,
      gradient: "from-cyan-500/20 to-cyan-600/5",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              className={cn(
                "relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-md",
                stat.gradient,
                "border border-white/10 shadow-lg shadow-black/5"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <AnimatedCounter
                      value={stat.value}
                      decimals={stat.decimals}
                      className="text-2xl font-bold tracking-tight text-white"
                    />
                  </div>
                  <div className={cn("rounded-xl bg-white/10 p-2.5", stat.iconColor)}>
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
