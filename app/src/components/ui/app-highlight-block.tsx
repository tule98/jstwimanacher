import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHighlightBlockProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

export function AppHighlightBlock({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
  variant = "default",
  size = "md",
}: AppHighlightBlockProps) {
  const variantStyles = {
    default: {
      background:
        "bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20",
      border: "border-green-200/50 dark:border-green-800/30",
      shadow: "shadow-lg shadow-green-100/50 dark:shadow-green-900/20",
      text: "text-green-800 dark:text-green-200",
      accent: "text-green-600 dark:text-green-400",
    },
    success: {
      background:
        "bg-gradient-to-br from-emerald-50/80 to-green-50/60 dark:from-emerald-950/30 dark:to-green-950/20",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      shadow: "shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20",
      text: "text-emerald-800 dark:text-emerald-200",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      background:
        "bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-950/30 dark:to-yellow-950/20",
      border: "border-amber-200/50 dark:border-amber-800/30",
      shadow: "shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20",
      text: "text-amber-800 dark:text-amber-200",
      accent: "text-amber-600 dark:text-amber-400",
    },
    error: {
      background:
        "bg-gradient-to-br from-red-50/80 to-rose-50/60 dark:from-red-950/30 dark:to-rose-950/20",
      border: "border-red-200/50 dark:border-red-800/30",
      shadow: "shadow-lg shadow-red-100/50 dark:shadow-red-900/20",
      text: "text-red-800 dark:text-red-200",
      accent: "text-red-600 dark:text-red-400",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "p-3 md:p-4",
      titleSize: "text-base md:text-lg",
      descriptionSize: "text-xs md:text-sm",
      iconSize: "w-4 h-4 md:w-5 md:h-5",
    },
    md: {
      padding: "p-4 md:p-6",
      titleSize: "text-lg md:text-xl",
      descriptionSize: "text-xs md:text-sm",
      iconSize: "w-5 h-5 md:w-6 md:h-6",
    },
    lg: {
      padding: "p-5 md:p-8",
      titleSize: "text-xl md:text-2xl",
      descriptionSize: "text-sm md:text-base",
      iconSize: "w-6 h-6 md:w-8 md:h-8",
    },
  };

  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={cn(
        // Glassmorphism base styles
        "relative overflow-hidden rounded-2xl",
        "backdrop-blur-xl backdrop-saturate-150",
        "border",
        // Variant-specific styles
        styles.background,
        styles.border,
        styles.shadow,
        // Size-specific styles
        sizeStyle.padding,
        // Custom className
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

      {/* Header */}
      {(title || description || Icon) && (
        <div className="relative z-10 mb-3 md:mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  {Icon && (
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-lg md:rounded-xl bg-white/20 dark:bg-white/10 p-1.5 md:p-2",
                        styles.accent
                      )}
                    >
                      <Icon className={sizeStyle.iconSize} />
                    </div>
                  )}
                  <h2
                    className={cn(
                      "font-bold tracking-tight",
                      styles.text,
                      sizeStyle.titleSize
                    )}
                  >
                    {title}
                  </h2>
                </div>
              )}
              {description && (
                <p
                  className={cn(
                    "opacity-80",
                    styles.text,
                    sizeStyle.descriptionSize
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="relative z-10 mt-3 md:mt-6 pt-3 md:pt-4 border-t border-white/20 dark:border-white/10">
          {footer}
        </div>
      )}

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-black/10 dark:to-transparent pointer-events-none rounded-2xl" />
    </div>
  );
}

export default AppHighlightBlock;
