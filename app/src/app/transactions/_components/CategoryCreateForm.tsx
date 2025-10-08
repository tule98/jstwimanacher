"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AppButton from "@/components/ui/app-button";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().min(4, "Color is required"),
  type: z.enum(["income", "expense"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryCreateFormProps {
  defaultType?: "income" | "expense";
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
}

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export default function CategoryCreateForm({
  defaultType = "expense",
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Create Category",
  showCancel = true,
}: CategoryCreateFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      color: defaultValues?.color || "#10b981",
      type: defaultValues?.type || defaultType,
    },
  });

  const selectedColor = watch("color");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., Groceries, Salary"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Category Type */}
      <div className="space-y-2">
        <Label>Category Type</Label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("type")}
              value="expense"
              className="w-4 h-4 text-emerald-600 cursor-pointer"
            />
            <span className="text-sm">Expense</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("type")}
              value="income"
              className="w-4 h-4 text-emerald-600 cursor-pointer"
            />
            <span className="text-sm">Income</span>
          </label>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>Category Color</Label>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="color"
            {...register("color")}
            className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
          />
          <Input
            type="text"
            value={selectedColor}
            onChange={(e) => setValue("color", e.target.value)}
            placeholder="#10b981"
            className="flex-1 font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-8 gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={`w-8 h-8 rounded cursor-pointer border-2 transition-all ${
                selectedColor === color
                  ? "border-gray-900 dark:border-white scale-110"
                  : "border-gray-300 dark:border-gray-600 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <AppButton type="submit" loading={isSubmitting} className="flex-1">
          {submitLabel}
        </AppButton>
        {showCancel && onCancel && (
          <AppButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </AppButton>
        )}
      </div>
    </form>
  );
}
