import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Loader({ size = "md", className, ...props }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-2 md:border-3 lg:border-4 border-blue-200"></div>
        <div className="absolute inset-0 rounded-full border-2 md:border-3 lg:border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}

export const LoaderOverlay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Loader size="lg" />
    </div>
  );
};
