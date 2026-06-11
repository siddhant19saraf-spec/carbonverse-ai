"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calculator,
  BrainCircuit,
  TrendingUp,
  FileText,
  Trophy,
  Shield,
  Settings,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import type { User } from "@/types";

interface SidebarProps {
  user: User;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/coach", label: "AI Coach", icon: BrainCircuit },
  { href: "/predictions", label: "Predictions", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

const levelColors: Record<string, string> = {
  seedling: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  sprout: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  tree: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  forest: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  earth: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
};

const levelNames: Record<number, string> = {
  1: "seedling", 2: "sprout", 3: "sapling", 4: "tree", 5: "forest", 6: "earth",
};

function getLevelBadge(level: number | string) {
  const name = typeof level === "number" ? levelNames[level] || "seedling" : level;
  return levelColors[name] || levelColors.seedling;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col"
          >
            <span className="text-sm font-bold tracking-tight text-white">CarbonVerse</span>
            <span className="text-[10px] font-medium text-emerald-300/70 uppercase tracking-widest">AI</span>
          </motion.div>
        )}
      </div>

      {/* User Info */}
      <div className="px-3 py-4 border-b border-white/10">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white ring-2 ring-emerald-400/30">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name || user.username} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(user.full_name || user.username)
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-semibold text-white truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </motion.div>
          )}
        </div>

        {/* Level Badge & Score */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-3 flex items-center gap-2"
          >
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                getLevelBadge(user.green_level || "seedling")
              )}
            >
              {levelNames[user.green_level as number] || "Seedling"}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {user.sustainability_score ?? 0} pts
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 flex-shrink-0 transition-colors",
                    active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {/* Admin Link */}
        {user.role === "admin" && (
          <Link href="/admin">
            <div
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive("/admin")
                  ? "bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              {isActive("/admin") && (
                <motion.div
                  layoutId="sidebar-active-admin"
                  className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Shield
                className={cn(
                  "relative z-10 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive("/admin") ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 truncate"
                >
                  Admin Dashboard
                </motion.span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                  Admin Dashboard
                </div>
              )}
            </div>
          </Link>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="relative z-10 h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 px-3 py-2 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={collapsed}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-white/10 bg-slate-900/80 backdrop-blur-xl"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-white/10 bg-slate-900/95 backdrop-blur-xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 lg:hidden hover:bg-emerald-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform", mobileOpen && "rotate-90")}
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
    </>
  );
}
