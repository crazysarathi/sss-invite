import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-field border-theme border-input bg-surface px-4 py-2 font-body text-base text-fg transition-colors",
          "placeholder:text-fg-subtle",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
          "aria-[invalid=true]:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
