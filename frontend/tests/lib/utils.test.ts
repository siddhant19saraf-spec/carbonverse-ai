import { cn, formatCarbon, getScoreColor, getScoreLabel, getCategoryIcon } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });
});

describe("formatCarbon", () => {
  it("formats kg values", () => {
    expect(formatCarbon(42.5)).toBe("42.5kg");
  });

  it("formats ton values", () => {
    expect(formatCarbon(1500)).toBe("1.5t");
  });

  it("formats small values", () => {
    expect(formatCarbon(0.5)).toBe("0.5kg");
  });
});

describe("getScoreColor", () => {
  it("returns emerald for high scores", () => {
    expect(getScoreColor(90)).toBe("text-emerald-500");
  });

  it("returns red for low scores", () => {
    expect(getScoreColor(10)).toBe("text-red-500");
  });

  it("returns yellow for medium scores", () => {
    expect(getScoreColor(50)).toBe("text-yellow-500");
  });
});

describe("getScoreLabel", () => {
  it("returns Excellent for 80+", () => {
    expect(getScoreLabel(95)).toBe("Excellent");
  });

  it("returns Good for 60+", () => {
    expect(getScoreLabel(70)).toBe("Good");
  });

  it("returns Average for 40+", () => {
    expect(getScoreLabel(50)).toBe("Average");
  });

  it("returns Below Average for 20+", () => {
    expect(getScoreLabel(30)).toBe("Below Average");
  });

  it("returns Needs Improvement for <20", () => {
    expect(getScoreLabel(10)).toBe("Needs Improvement");
  });
});

describe("getCategoryIcon", () => {
  it("returns icons for known categories", () => {
    expect(getCategoryIcon("transportation")).toBe("🚗");
    expect(getCategoryIcon("food")).toBe("🍽️");
    expect(getCategoryIcon("electricity")).toBe("⚡");
    expect(getCategoryIcon("water")).toBe("💧");
    expect(getCategoryIcon("waste")).toBe("♻️");
  });

  it("returns default icon for unknown", () => {
    expect(getCategoryIcon("unknown")).toBe("📊");
  });
});
