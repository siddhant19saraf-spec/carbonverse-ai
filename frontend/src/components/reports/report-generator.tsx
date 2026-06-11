"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReportGeneratorProps {
  token?: string;
}

interface GenerateResponse {
  report_id: string;
  status: string;
}

interface DownloadResponse {
  download_url: string;
}

export function ReportGenerator({ token }: ReportGeneratorProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

  const handleGenerate = async () => {
    if (!isValid) {
      toast({
        title: "Invalid dates",
        description: "Please select a valid date range.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post<GenerateResponse>(
        "/reports/generate",
        {
          start_date: startDate,
          end_date: endDate,
          include_recommendations: includeRecommendations,
        },
        token
      );
      setReportId(response.report_id);
      toast({
        title: "Report generated",
        description: "Your sustainability report is ready to download.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate report";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!reportId) return;

    try {
      setDownloading(true);
      const response = await api.post<DownloadResponse>(
        "/reports/download",
        { report_id: reportId },
        token
      );

      const link = document.createElement("a");
      link.href = response.download_url;
      link.download = `carbon-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Download started", description: "Your PDF report is downloading." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download report";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-blue-400" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Create a detailed sustainability report for a date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="border-white/10 bg-white/5 text-white placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-white">
                Include AI Recommendations
              </Label>
              <p className="text-xs text-muted-foreground">
                Get personalized suggestions to reduce your footprint
              </p>
            </div>
            <Switch
              checked={includeRecommendations}
              onCheckedChange={setIncludeRecommendations}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!isValid || generating}
              className={cn(
                "flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600",
                generating && "opacity-80"
              )}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>

            {reportId && (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
