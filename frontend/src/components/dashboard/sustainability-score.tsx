"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SustainabilityScoreProps {
  score: number;
  level: string;
}

function getScoreGradient(score: number): { stroke: string; glow: string; text: string } {
  if (score >= 80) return { stroke: "#10b981", glow: "shadow-emerald-500/30", text: "text-emerald-400" };
  if (score >= 60) return { stroke: "#22c55e", glow: "shadow-green-500/30", text: "text-green-400" };
  if (score >= 40) return { stroke: "#eab308", glow: "shadow-yellow-500/30", text: "text-yellow-400" };
  if (score >= 20) return { stroke: "#f97316", glow: "shadow-orange-500/30", text: "text-orange-400" };
  return { stroke: "#ef4444", glow: "shadow-red-500/30", text: "text-red-400" };
}

function getLevelEmoji(level: string): string {
  const map: Record<string, string> = {
    excellent: "🌿",
    good: "🌱",
    average: "🌾",
    "below average": "🍂",
    "needs improvement": "🔥",
  };
  return map[level.toLowerCase()] || "🌍";
}

export function SustainabilityScore({ score, level }: SustainabilityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const { stroke, glow, text } = getScoreGradient(score);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();
    let animationFrame: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, score]);

  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card
        className={cn(
          "border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md",
          glow
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sustainability Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-6">
          <div className="relative h-[180px] w-[180px]">
            <svg
              viewBox="0 0 160 160"
              className="h-full w-full -rotate-90"
            >
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#1f2937"
                strokeWidth="10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ filter: `drop-shadow(0 0 8px ${stroke}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", text)}>
                {animatedScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Current Level</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{getLevelEmoji(level)}</span>
              <span className={cn("text-lg font-semibold capitalize", text)}>
                {level}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
