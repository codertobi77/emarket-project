import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20 after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md hover:shadow-destructive/20 after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        outline:
          "border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md hover:shadow-secondary/10 after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ghost: "hover:bg-primary/5 hover:text-primary",
        link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md hover:shadow-accent/20 after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        glass: "bg-background/70 backdrop-blur-sm border border-border/20 hover:bg-background/90 hover:border-primary/30 hover:text-primary",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-sm hover:shadow-md hover:shadow-primary/20"
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }