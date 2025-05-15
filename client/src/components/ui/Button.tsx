import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { type LucideIcon } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  loading?: boolean;
  ariaLabel?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  iconClassName?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      ariaLabel,
      children,
      disabled,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      iconClassName,
      ...props
    },
    ref
  ) => {
    const iconSize = {
      default: 16,
      sm: 14,
      lg: 18,
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90":
              variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/60 active:bg-secondary/60":
              variant === "secondary",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        {...props}
      >
        {loading ? (
          <Loader size="sm" className="mr-2" />
        ) : LeftIcon ? (
          <LeftIcon
            className={cn("mr-2", iconClassName)}
            size={iconSize[size]}
          />
        ) : null}
        {children}
        {RightIcon && !loading && (
          <RightIcon
            className={cn("ml-2", iconClassName)}
            size={iconSize[size]}
          />
        )}
      </button>
    );
  }
);
