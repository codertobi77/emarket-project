'use client';

'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn, getNormalizedImagePath } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'status' | 'outline' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away' | 'none';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, variant = 'default', status = 'none', ...props }, ref) => {
    const variants = {
      default: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-sm transition-all duration-200',
      bordered: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-background shadow-md transition-all duration-200',
      status: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full transition-all duration-200',
      outline: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm transition-all duration-200',
      square: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-md shadow-sm transition-all duration-200'
    };
    
    return (
      <div className="relative inline-block">
        <div
          ref={ref}
          className={cn(variants[variant || 'default'], className)}
          {...props}
        />
        {variant === 'status' && status !== 'none' && (
          <span className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-background",
            status === 'online' && "bg-green-500", 
            status === 'offline' && "bg-gray-400",
            status === 'busy' && "bg-red-500",
            status === 'away' && "bg-yellow-500"
          )} />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends Omit<React.ComponentPropsWithoutRef<typeof Image>, 'alt' | 'src'> {
  src?: string | null;
  alt?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement | null, AvatarImageProps>(
  ({ className, src: srcProp, alt = "Avatar", ...props }, ref) => {
    const src = srcProp || '';
    const [imageError, setImageError] = React.useState(false);
    
    const normalizedSrc = getNormalizedImagePath(src);

    if (!normalizedSrc) {
      return null;
    }

    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        ref={ref}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImageError(true)}
        className={cn(
          'aspect-square h-full w-full object-cover transition-opacity duration-300',
          imageError ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, delayMs = 600, ...props }, ref) => {
    const [initialsFromName, setInitialsFromName] = React.useState<string>("");
    const [visible, setVisible] = React.useState(false);
    
    React.useEffect(() => {
      const timer = setTimeout(() => setVisible(true), delayMs);
      return () => clearTimeout(timer);
    }, [delayMs]);
    
    React.useEffect(() => {
      if (typeof children === 'string') {
        const nameArray = children.trim().split(/\s+/);
        let initials = '';
        
        if (nameArray.length === 1) {
          initials = nameArray[0].substring(0, 2).toUpperCase();
        } else {
          initials = (nameArray[0][0] + nameArray[nameArray.length - 1][0]).toUpperCase();
        }
        
        setInitialsFromName(initials);
      }
    }, [children]);
    
    if (!visible) {
      return null;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-muted/50 font-medium text-foreground/80 text-sm backdrop-blur-sm ring-1 ring-border/20',
          className
        )}
        {...props}
      >
        {children || initialsFromName || <span className="text-primary/40 text-xl">?</span>}
      </div>
    );
  }
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
