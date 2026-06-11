"use client";

import { motion } from "framer-motion";
import { ChatInterface } from "@/components/coach/chat-interface";
import { WeeklyInsightsCard } from "@/components/coach/weekly-insights-card";
import { DailyTipCard } from "@/components/calculator/daily-tip-card";

export default function CoachPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>
        <div className="space-y-6">
          <WeeklyInsightsCard />
          <DailyTipCard />
        </div>
      </div>
    </motion.div>
  );
}
