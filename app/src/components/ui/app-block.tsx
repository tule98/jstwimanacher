import React from "react";
import { cn } from "@/lib/utils";

interface MetadataItem {
  key: string;
  value: string | number;
  className?: string;
}

interface AppBlockProps {
  title: string;
  value: string | number | React.ReactNode;
  metadata?: MetadataItem[];
  className?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function AppBlock({
  title,
  value,
  metadata = [],
  className,
  variant = "default",
  size = "md",
  icon,
  children,
}: AppBlockProps) {
  const variantStyles = {
    default: {
      background: "bg-white/30 dark:bg-white/10",
      border: "border-white/20 dark:border-white/10",
      title: "text-gray-700 dark:text-gray-300",
      value: "text-gray-900 dark:text-gray-100",
      metadata: "text-gray-600 dark:text-gray-400",
      divider: "border-gray-300 dark:border-gray-600",
    },
    success: {
      background: "bg-emerald-50/80 dark:bg-emerald-950/20",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      title: "text-emerald-700 dark:text-emerald-300",
      value: "text-emerald-600 dark:text-emerald-400",
      metadata: "text-emerald-600 dark:text-emerald-400",
      divider: "border-emerald-300 dark:border-emerald-700",
    },
    warning: {
      background: "bg-amber-50/80 dark:bg-amber-950/20",
      border: "border-amber-200/50 dark:border-amber-800/30",
      title: "text-amber-700 dark:text-amber-300",
      value: "text-amber-600 dark:text-amber-400",
      metadata: "text-amber-600 dark:text-amber-400",
      divider: "border-amber-300 dark:border-amber-700",
    },
    error: {
      background: "bg-red-50/80 dark:bg-red-950/20",
      border: "border-red-200/50 dark:border-red-800/30",
      title: "text-red-700 dark:text-red-300",
      value: "text-red-600 dark:text-red-400",
      metadata: "text-red-600 dark:text-red-400",
      divider: "border-red-300 dark:border-red-700",
    },
    info: {
      background: "bg-blue-50/80 dark:bg-blue-950/20",
      border: "border-blue-200/50 dark:border-blue-800/30",
      title: "text-blue-700 dark:text-blue-300",
      value: "text-blue-600 dark:text-blue-400",
      metadata: "text-blue-600 dark:text-blue-400",
      divider: "border-blue-300 dark:border-blue-700",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "p-3",
      titleSize: "text-xs",
      valueSize: "text-lg",
      metadataSize: "text-xs",
    },
    md: {
      padding: "p-4",
      titleSize: "text-sm",
      valueSize: "text-xl",
      metadataSize: "text-xs",
    },
    lg: {
      padding: "p-6",
      titleSize: "text-base",
      valueSize: "text-2xl",
      metadataSize: "text-sm",
    },
  };

  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={cn(
        // Base styles
        "text-center rounded-xl border backdrop-blur-sm",
        "transition-all duration-200 hover:scale-[1.02]",
        // Variant styles
        styles.background,
        styles.border,
        // Size styles
        sizeStyle.padding,
        // Custom className
        className
      )}
    >
      {/* Header with icon and title */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {icon && (
          <div className={cn("flex-shrink-0", styles.value)}>{icon}</div>
        )}
        <h3 className={cn("font-medium", styles.title, sizeStyle.titleSize)}>
          {title}
        </h3>
      </div>

      {/* Primary value */}
      <p className={cn("font-bold mb-3", styles.value, sizeStyle.valueSize)}>
        {value}
      </p>

      {/* Metadata items */}
      {metadata.length > 0 && (
        <div className="space-y-1">
          {metadata.map((item, index) => (
            <div key={index}>
              {index > 0 && (
                <div
                  className={cn("border-t opacity-30 my-1", styles.divider)}
                />
              )}
              <div
                className={cn(
                  "flex justify-between items-center",
                  styles.metadata,
                  sizeStyle.metadataSize,
                  item.className
                )}
              >
                <span>{item.key}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional children content */}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default AppBlock;
