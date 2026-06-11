"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmissionForm } from "@/components/calculator/emission-form";
import { CarbonResult } from "@/components/calculator/carbon-result";
import { DailyTipCard } from "@/components/calculator/daily-tip-card";
import type { CarbonScore } from "@/types";

export default function CalculatorPage() {
  const [lastScore, setLastScore] = useState<CarbonScore | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionForm onResult={setLastScore} />
        <div className="space-y-6">
          {lastScore ? (
            <CarbonResult score={lastScore} />
          ) : (
            <div className="p-8 rounded-xl border border-border bg-card text-center">
              <p className="text-muted-foreground">Fill out the form to calculate your carbon footprint</p>
            </div>
          )}
        </div>
      </div>
      <DailyTipCard />
    </motion.div>
  );
}
