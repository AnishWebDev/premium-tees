import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variants map to CSS classes in globals.css (.theme-button*).
 * Hover colors are owned by CSS (not Tailwind hover:bg-*) so they cannot be
 * overridden by conflicting utilities or equal CSS-variable fill/hover pairs.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Primary CTA — uses --button-* theme tokens */
        default: "theme-button",
        /** Muted surface button */
        secondary: "theme-button-secondary",
        /** Bordered transparent */
        outline: "theme-button-outline",
        /** No chrome until hover */
        ghost: "theme-button-ghost",
        /** Light fill for always-dark surfaces (footer Join, etc.) */
        inverse: "theme-button-inverse",
        link: "theme-link bg-transparent p-0 h-auto border-0",
        destructive: "theme-button-destructive",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
