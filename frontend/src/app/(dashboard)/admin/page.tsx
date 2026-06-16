"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthContext } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Activity } from "lucide-react";

export default function AdminPage() {
  const { user, tokens } = useAuthContext();
  const router = useRouter();
  const [health, setHealth] = useState<string>("checking");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!tokens || user?.role !== "admin") return;
    api
      .get<{ status: string }>("/admin/system-health", tokens.access_token)
      .then((data) => setHealth(data.status || "unknown"))
      .catch(() => setHealth("error"));
  }, [tokens, user]);

  if (user?.role !== "admin") return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-emerald-500" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                health === "healthy"
                  ? "bg-emerald-500"
                  : health === "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            />
            <span className="font-medium capitalize">{health}</span>
          </div>
        </CardContent>
      </Card>

      <AnalyticsCards />
      <UserManagementTable />
    </motion.div>
  );
}
