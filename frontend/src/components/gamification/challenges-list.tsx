"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Trophy, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UserChallenge } from "@/types";

interface ChallengesListProps {
  token?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function ChallengesList({ token }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<UserChallenge[]>("/challenges/", token);
      setChallenges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load challenges";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

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
          <Button variant="outline" size="sm" onClick={fetchChallenges}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No active challenges</p>
          <p className="text-xs text-muted-foreground/70">
            Check back soon for new sustainability challenges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-5 w-5 text-amber-400" />
          Active Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((uc, i) => {
          const progressPercent = uc.challenge.goal_value > 0
            ? Math.min((uc.progress / uc.challenge.goal_value) * 100, 100)
            : 0;

          return (
            <motion.div
              key={uc.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  uc.completed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">
                        {uc.challenge.title}
                      </h4>
                      <Badge
                        variant={uc.completed ? "default" : "secondary"}
                        className={cn(
                          "text-[10px]",
                          uc.completed && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        )}
                      >
                        {uc.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {uc.challenge.description}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {uc.progress} / {uc.challenge.goal_value}
                        </span>
                        <span className="font-medium text-amber-400">
                          +{uc.challenge.reward_score} pts
                        </span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className="h-1.5"
                      />
                    </div>
                  </div>

                  {!uc.completed && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-white"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Continue Challenge</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
