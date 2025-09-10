import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title text */
  title: string;
  /** Optional card description */
  description?: string;
  /** Optional icon to display with title */
  icon?: LucideIcon;
  /** Icon size (default: 20) */
  iconSize?: number;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Apply shadow styling (default: true) */
  shadow?: boolean;
}

const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  (
    {
      className,
      title,
      description,
      icon: Icon,
      iconSize = 20,
      footer,
      shadow = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          shadow && "shadow-md",
          //   variantStyles[variant],
          className
        )}
        {...props}
      >
        <CardHeader className="p-2 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle
              className={cn(
                "flex items-center gap-2 text-primary dark:text-green-400"
              )}
            >
              {Icon && <Icon size={iconSize} />}
              {title}
            </CardTitle>
            {footer && <div className="flex-shrink-0">{footer}</div>}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>

        <CardContent className="p-2 md:p-2">{children}</CardContent>
      </Card>
    );
  }
);

AppCard.displayName = "AppCard";

export { AppCard };
export type { AppCardProps };
