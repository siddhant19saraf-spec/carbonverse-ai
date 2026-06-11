"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { PredictionChart } from "@/components/charts/prediction-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Activity, Target } from "lucide-react";
import toast from "react-hot-toast";
import type { PredictionResponse } from "@/types";

export default function PredictionsPage() {
  const { tokens } = useAuthContext();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [monthsAhead, setMonthsAhead] = useState(3);
  const [loading, setLoading] = useState(true);

  const fetchPrediction = useCallback(async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      const data = await api.post<PredictionResponse>("/predictions/", { months_ahead: monthsAhead }, tokens.access_token);
      setPrediction(data);
    } catch (err: any) {
      toast.error(err.detail || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  }, [tokens, monthsAhead]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold">Forecast Period</h2>
        {[1, 3, 6, 12].map((m) => (
          <Button
            key={m}
            variant={monthsAhead === m ? "default" : "outline"}
            size="sm"
            onClick={() => setMonthsAhead(m)}
            className={monthsAhead === m ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            aria-pressed={monthsAhead === m}
          >
            {m} {m === 1 ? "Month" : "Months"}
          </Button>
        ))}
      </div>

      {prediction && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trend Direction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {prediction.trend_direction === "decreasing" ? (
                    <TrendingDown className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  ) : prediction.trend_direction === "increasing" ? (
                    <TrendingUp className="h-5 w-5 text-red-500" aria-hidden="true" />
                  ) : (
                    <Activity className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  )}
                  <span className="text-2xl font-bold capitalize">{prediction.trend_direction}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{(prediction.confidence_score * 100).toFixed(0)}%</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projected Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  <span className="text-2xl font-bold">{prediction.projected_score}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {prediction.predictions.length > 0 ? (
            <PredictionChart predictions={prediction.predictions} />
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Record more emissions data to see predictions
            </Card>
          )}
        </>
      )}

      {loading && (
        <div className="h-80 rounded-xl bg-muted animate-pulse" role="status" aria-label="Loading predictions">
          <span className="sr-only">Loading predictions...</span>
        </div>
      )}
    </motion.div>
  );
}
