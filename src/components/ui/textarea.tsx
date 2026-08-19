import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[112px] w-full rounded-field border-theme border-input bg-surface px-4 py-3 font-body text-base text-fg transition-colors",
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
Textarea.displayName = "Textarea";

export { Textarea };
