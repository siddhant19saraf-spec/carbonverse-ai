export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  sustainability_score: number;
  carbon_saved: number;
  green_level: number;
  streak_days: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface EmissionRecord {
  id: string;
  user_id: string;
  category: string;
  subcategory?: string;
  amount: number;
  unit: string;
  carbon_footprint: number;
  recorded_at: string;
  created_at: string;
}

export interface EmissionSummary {
  total_carbon: number;
  category_breakdown: Record<string, number>;
  daily_average: number;
  weekly_total: number;
  monthly_total: number;
}

export interface CarbonScore {
  score: number;
  level: string;
  total_emissions: number;
  category_breakdown: Record<string, number>;
  suggestions: string[];
}

export interface Prediction {
  date: string;
  predicted_value: number;
  upper_bound: number;
  lower_bound: number;
}

export interface PredictionResponse {
  predictions: Prediction[];
  trend_direction: string;
  confidence_score: number;
  projected_score: number;
}

export interface GamificationState {
  current_score: number;
  green_level: number;
  streak_days: number;
  total_badges: number;
  weekly_progress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
}

export interface UserAchievement {
  id: string;
  achievement: Achievement;
  unlocked_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  goal_value: number;
  reward_score: number;
}

export interface UserChallenge {
  id: string;
  challenge: Challenge;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export interface WeeklyInsight {
  week_start: string;
  week_end: string;
  summary: string;
  achievements: string[];
  areas_for_improvement: string[];
  next_week_goals: string[];
}

export interface SustainabilityGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_carbon_reduction: number;
  current_reduction: number;
  category: string;
  target_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachResponse {
  reply: string;
  suggestions: string[];
}

export interface NationalComparison {
  user_total: number;
  national_total: number;
  difference_pct: number;
  breakdown: Record<string, { user: number; national: number; difference_pct: number }>;
}

export interface AdminUserAnalytics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  verified_users: number;
}

export interface AdminPlatformMetrics {
  total_emissions_recorded: number;
  avg_sustainability_score: number;
  total_achievements_unlocked: number;
  total_challenges_completed: number;
}
