"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useAuthContext } from "@/providers/AuthProvider";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calculator": "Carbon Calculator",
  "/coach": "AI Coach",
  "/predictions": "Predictions",
  "/reports": "Reports",
  "/achievements": "Achievements",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const basePath = "/" + segments[0];
    if (pageTitles[basePath]) return pageTitles[basePath];
  }
  return "CarbonVerse";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const [notificationCount] = useState(3);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = getPageTitle(pathname);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-400 hover:text-white"
        onClick={() => {
          const event = new CustomEvent("toggle-mobile-sidebar");
          window.dispatchEvent(event);
        }}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-white"
        >
          {pageTitle}
        </motion.h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <Separator orientation="vertical" className="hidden md:block h-6 bg-white/10" />

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-400 hover:text-white hover:bg-white/5"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {mounted ? (
          <>
            <Sun
              className={cn(
                "h-5 w-5 transition-all",
                theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute"
              )}
            />
            <Moon
              className={cn(
                "h-5 w-5 transition-all",
                theme === "dark" ? "-rotate-90 scale-0 absolute" : "rotate-0 scale-100"
              )}
            />
          </>
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative text-slate-400 hover:text-white hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
            {notificationCount}
          </span>
        )}
      </Button>

      <Separator orientation="vertical" className="h-6 bg-white/10" />

      {/* User Dropdown */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.full_name || user.username)
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-white">{user.full_name || user.username}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/10 bg-slate-800/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.full_name || user.username)
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.full_name || user.username}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 text-slate-300 focus:bg-white/10 focus:text-white cursor-pointer"
            >
              <User className="h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
