"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import Header from "./header";
import type { User } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen bg-slate-950">
      {/* Background gradient effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/3 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col lg:pl-[260px] transition-all duration-300">
        <Header />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 px-4 py-4 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} CarbonVerse AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Terms
              </a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
