import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCarbon(value: number): string {
  const n = typeof value === "number" && !isNaN(value) ? value : 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}t`;
  return `${n.toFixed(1)}kg`;
}

export function formatDate(date: string | Date): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getScoreColor(score: number): string {
  const n = typeof score === "number" && !isNaN(score) ? score : 0;
  if (n >= 80) return "text-emerald-500";
  if (n >= 60) return "text-green-500";
  if (n >= 40) return "text-yellow-500";
  if (n >= 20) return "text-orange-500";
  return "text-red-500";
}

export function getScoreLabel(score: number): string {
  const n = typeof score === "number" && !isNaN(score) ? score : 0;
  if (n >= 80) return "Excellent";
  if (n >= 60) return "Good";
  if (n >= 40) return "Average";
  if (n >= 20) return "Below Average";
  return "Needs Improvement";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    transportation: "🚗",
    food: "🍽️",
    electricity: "⚡",
    water: "💧",
    waste: "♻️",
  };
  return icons[category] || "📊";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    transportation: "#3b82f6",
    food: "#f59e0b",
    electricity: "#8b5cf6",
    water: "#06b6d4",
    waste: "#10b981",
  };
  return colors[category] || "#6b7280";
}
