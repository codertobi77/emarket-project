import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'glass' | 'hover' | 'outline' }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'rounded-lg border border-border/40 bg-card text-card-foreground shadow-sm transition-all duration-200',
    glass: 'rounded-lg border border-border/20 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm transition-all duration-200',
    hover: 'rounded-lg border border-border/40 bg-card text-card-foreground shadow-sm hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200',
    outline: 'rounded-lg border-2 border-primary/20 bg-card text-card-foreground shadow-sm transition-all duration-200'
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        variantStyles[variant || 'default'],
        className
      )}
      {...props}
    />
  )
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 p-6 relative', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-foreground/60 leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0 relative', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between p-6 pt-4 mt-2 relative border-t border-border/20', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
