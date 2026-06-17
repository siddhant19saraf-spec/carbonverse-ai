"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { EmissionTrends } from "@/components/dashboard/emission-trends";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { SustainabilityScore } from "@/components/dashboard/sustainability-score";
import { DailyTipCard } from "@/components/calculator/daily-tip-card";
import toast from "react-hot-toast";
import type { EmissionSummary, CarbonScore, NationalComparison } from "@/types";

export default function DashboardPage() {
  const { tokens } = useAuthContext();
  const [summary, setSummary] = useState<EmissionSummary | null>(null);
  const [score, setScore] = useState<CarbonScore | null>(null);
  const [comparison, setComparison] = useState<NationalComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens) return;
    const fetchData = async () => {
      try {
        const [summaryRes, scoreRes, compRes] = await Promise.all([
          api.get<EmissionSummary>("/emissions/summary", tokens.access_token),
          api.get<CarbonScore>("/emissions/score", tokens.access_token),
          api.get<NationalComparison>("/emissions/compare-national", tokens.access_token),
        ]);
        setSummary(summaryRes);
        setScore(scoreRes);
        setComparison(compRes);
      } catch (err: any) {
        toast.error(err.detail || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tokens]);

  const emptyScore: CarbonScore = { score: 0, level: "N/A", total_emissions: 0, category_breakdown: {}, suggestions: [] };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" aria-hidden="true" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-xl bg-muted animate-pulse" aria-hidden="true" />
          <div className="h-80 rounded-xl bg-muted animate-pulse" aria-hidden="true" />
        </div>
        <span className="sr-only">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {summary && <KpiCards summary={summary} score={score || emptyScore} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {summary && (
            <EmissionTrends
              dailyTotals={[
                { date: new Date().toISOString(), total: summary.daily_average },
              ]}
            />
          )}
        </div>
        <div>
          {score && <SustainabilityScore score={score.score ?? 0} level={score.level ?? ""} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary && <CategoryBreakdown breakdown={summary.category_breakdown} />}
        <DailyTipCard />
      </div>

      {comparison && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-border bg-card"
          role="region"
          aria-label="National average comparison"
        >
          <h3 className="text-lg font-semibold mb-4">vs. National Average</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{(comparison.user_total ?? 0).toFixed(1)}kg</p>
              <p className="text-xs text-muted-foreground">Your Monthly</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{(comparison.national_total ?? 0).toFixed(1)}kg</p>
              <p className="text-xs text-muted-foreground">National Avg</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${(comparison.difference_pct ?? 0) <= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {(comparison.difference_pct ?? 0) > 0 ? "+" : ""}{(comparison.difference_pct ?? 0).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Difference</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
