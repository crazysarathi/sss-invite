import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Theme-driven button: radius, font voice, tracking, case, border width,
 * shadow and colors all come from the active theme's tokens.
 */
const buttonVariants = cva(
  [
    "t-accent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn",
    "transition-[color,background-color,border-color,box-shadow,transform,filter] duration-micro ease-theme",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.05em] [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-theme border-primary bg-primary text-primary-foreground shadow-btn hover:brightness-[1.06] active:translate-y-px",
        secondary:
          "border-theme border-secondary bg-secondary text-secondary-foreground hover:brightness-[1.05] active:translate-y-px",
        outline:
          "border-theme border-line-strong bg-transparent text-fg hover:border-fg hover:bg-fg hover:text-page",
        ghost: "border-theme border-transparent bg-transparent text-fg hover:bg-fg/[0.06]",
        inverse:
          "border-theme border-fg bg-fg text-page hover:bg-transparent hover:text-fg",
        link: "text-primary underline-offset-4 hover:underline [letter-spacing:0.04em]",
      },
      size: {
        default: "h-12 px-7 text-sm",
        sm: "h-10 px-5 text-xs",
        lg: "h-14 px-9 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
