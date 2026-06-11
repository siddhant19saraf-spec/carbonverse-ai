"use client";

import { motion } from "framer-motion";
import { ReportGenerator } from "@/components/reports/report-generator";

export default function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ReportGenerator />
    </motion.div>
  );
}
