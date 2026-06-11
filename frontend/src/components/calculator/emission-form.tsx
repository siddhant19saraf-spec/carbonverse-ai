"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Utensils,
  Zap,
  Droplets,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { emissionSchema, type EmissionFormData } from "@/lib/validators";
import { api } from "@/lib/api";
import { useAuthContext } from "@/providers/AuthProvider";
import type { CarbonScore } from "@/types";

interface EmissionFormProps {
  onResult?: (score: CarbonScore) => void;
}

const CATEGORIES = [
  {
    value: "transportation",
    label: "Transportation",
    icon: Car,
    subcategories: [
      { value: "car", label: "Car" },
      { value: "bus", label: "Bus" },
      { value: "train", label: "Train" },
      { value: "flight", label: "Flight" },
      { value: "bike", label: "Bike" },
      { value: "walk", label: "Walk" },
      { value: "motorcycle", label: "Motorcycle" },
      { value: "ev", label: "Electric Vehicle" },
    ],
  },
  {
    value: "food",
    label: "Food",
    icon: Utensils,
    subcategories: [
      { value: "meat", label: "Meat" },
      { value: "dairy", label: "Dairy" },
      { value: "vegetables", label: "Vegetables" },
      { value: "grains", label: "Grains" },
      { value: "fruit", label: "Fruit" },
      { value: "seafood", label: "Seafood" },
      { value: "processed", label: "Processed" },
      { value: "plant_based", label: "Plant-Based" },
    ],
  },
  {
    value: "electricity",
    label: "Electricity",
    icon: Zap,
    subcategories: [
      { value: "default", label: "Standard Grid" },
      { value: "solar", label: "Solar" },
      { value: "wind", label: "Wind" },
      { value: "natural_gas", label: "Natural Gas" },
    ],
  },
  {
    value: "water",
    label: "Water",
    icon: Droplets,
    subcategories: [
      { value: "default", label: "Cold Water" },
      { value: "hot", label: "Hot Water" },
    ],
  },
  {
    value: "waste",
    label: "Waste",
    icon: Trash2,
    subcategories: [
      { value: "landfill", label: "Landfill" },
      { value: "recycled", label: "Recycled" },
      { value: "composted", label: "Composted" },
    ],
  },
];

const UNITS = [
  { value: "km", label: "Kilometers" },
  { value: "kWh", label: "Kilowatt-hours" },
  { value: "liter", label: "Liters" },
  { value: "kg", label: "Kilograms" },
  { value: "meal", label: "Meals" },
  { value: "gallon", label: "Gallons" },
];

export function EmissionForm({ onResult }: EmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { tokens } = useAuthContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmissionFormData>({
    resolver: zodResolver(emissionSchema),
    defaultValues: {
      category: "transportation",
      subcategory: "car",
      amount: 0,
      unit: "km",
    },
  });

  const selectedCategory = watch("category");

  const currentCategory = CATEGORIES.find(
    (c) => c.value === selectedCategory
  );

  const handleCategoryChange = (value: string) => {
    setValue("category", value as EmissionFormData["category"]);
    const category = CATEGORIES.find((c) => c.value === value);
    if (category?.subcategories.length) {
      setValue(
        "subcategory",
        category.subcategories[0].value as EmissionFormData["subcategory"]
      );
    }
  };

  const onSubmit = async (data: EmissionFormData) => {
    setIsSubmitting(true);
    try {
      await api.post("/emissions/", data, tokens?.access_token);
      const score = await api.get<CarbonScore>("/emissions/score", tokens?.access_token);
      setIsSuccess(true);
      onResult?.(score);
      toast.success("Emission recorded successfully!");
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 2000);
    } catch (error) {
      toast.error("Failed to record emission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3 },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
    >
      <h2 className="text-xl font-semibold text-white mb-6">
        Record Emission
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div
          custom={0}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label className="text-sm text-white/70">Category</Label>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Emission category">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs transition-all duration-200",
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("category")} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-sm text-white/70">Subcategory</Label>
            <Select
              value={watch("subcategory")}
              onValueChange={(val) =>
                setValue(
                  "subcategory",
                  val as EmissionFormData["subcategory"]
                )
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {currentCategory?.subcategories.map((sub) => (
                  <SelectItem
                    key={sub.value}
                    value={sub.value}
                    className="text-white focus:bg-emerald-500/20 focus:text-emerald-400"
                  >
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </AnimatePresence>

        <motion.div
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label className="text-sm text-white/70" htmlFor="amount">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-red-400">{errors.amount.message}</p>
          )}
        </motion.div>

        <motion.div
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <Label className="text-sm text-white/70">Unit</Label>
          <Select
            value={watch("unit")}
            onValueChange={(val) =>
              setValue("unit", val as EmissionFormData["unit"])
            }
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {UNITS.map((unit) => (
                <SelectItem
                  key={unit.value}
                  value={unit.value}
                  className="text-white focus:bg-emerald-500/20 focus:text-emerald-400"
                >
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          custom={4}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className={cn(
              "w-full py-6 text-base font-medium transition-all duration-300",
              isSuccess
                ? "bg-emerald-500 hover:bg-emerald-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            )}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Recording...
                </motion.span>
              ) : isSuccess ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Recorded!
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Record Emission
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
