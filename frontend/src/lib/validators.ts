import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().optional(),
});

export const emissionSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  unit: z.string().min(1, "Unit is required"),
  recorded_at: z.string().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  target_carbon_reduction: z.number().positive("Must be positive"),
  category: z.string().min(1, "Category is required"),
  target_date: z.string().min(1, "Target date is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EmissionInput = z.infer<typeof emissionSchema>;
export type EmissionFormData = z.infer<typeof emissionSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
