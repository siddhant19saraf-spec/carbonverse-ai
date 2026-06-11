"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
}

export function DailyTipCard() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTip = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await api.get<DailyTip>("/tips/daily");
      setTip(response);
    } catch {
      setTip({
        id: "fallback",
        title: "Reduce, Reuse, Recycle",
        content:
          "One of the most effective ways to lower your carbon footprint is to follow the 3 Rs. Reduce your consumption, reuse items when possible, and recycle materials that can be processed again.",
        category: "general",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const shimmerVariants = {
    animate: {
      backgroundPosition: ["200% 0%", "-200% 0%"],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
            <Leaf className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white/90">
            Daily Green Tip
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10"
          onClick={() => fetchTip(true)}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 transition-transform",
              isRefreshing && "animate-spin"
            )}
          />
        </Button>
      </div>

      <div className="relative mt-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-4 w-2/3 rounded bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-4/5 rounded bg-white/5" />
                <div className="h-3 w-3/5 rounded bg-white/5" />
              </div>
            </motion.div>
          ) : tip ? (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h4 className="text-base font-medium text-white">
                {tip.title}
              </h4>
              <p className="text-sm leading-relaxed text-white/60">
                {tip.content}
              </p>
              <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                {tip.category}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
