import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow',
        secondary:
          'border-transparent bg-secondary/90 text-secondary-foreground shadow-sm hover:bg-secondary/95 hover:shadow',
        destructive:
          'border-transparent bg-destructive/90 text-destructive-foreground shadow-sm hover:bg-destructive/95 hover:shadow',
        outline: 
          'border-border/50 bg-background/80 text-foreground shadow-sm hover:border-primary/30 hover:text-primary hover:shadow',
        success: 
          'border-transparent bg-green-500/90 text-white shadow-sm hover:bg-green-500/95 hover:shadow',
        warning: 
          'border-transparent bg-yellow-500/90 text-white shadow-sm hover:bg-yellow-500/95 hover:shadow',
        info: 
          'border-transparent bg-blue-500/90 text-white shadow-sm hover:bg-blue-500/95 hover:shadow',
        gradient: 
          'border-transparent bg-gradient-to-r from-primary/80 to-accent/80 text-white shadow-sm hover:from-primary/90 hover:to-accent/90 hover:shadow',
        subtle: 
          'border-transparent bg-primary/10 text-primary shadow-sm hover:bg-primary/20',
        ghost: 
          'border-border/20 bg-transparent text-foreground/70 hover:bg-background hover:text-foreground hover:border-border/50',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[0.65rem]',
        lg: 'px-3 py-1 text-sm',
      },
      rounded: {
        default: 'rounded-full',
        md: 'rounded-md',
        sm: 'rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
      icon?: React.ReactNode;
    }

function Badge({ className, variant, size, rounded, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, rounded }), className)} {...props}>
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
