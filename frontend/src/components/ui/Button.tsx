import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-vexo-red/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95 cursor-pointer';

    const variants = {
      primary:
        'bg-gradient-to-r from-vexo-red to-vexo-red-bright text-white shadow-lg hover:shadow-vexo-red/30 hover:brightness-110 border border-vexo-red-bright/30',
      secondary:
        'bg-vexo-surface text-vexo-white hover:bg-neutral-800 border border-white/10 hover:border-white/20',
      outline:
        'border border-vexo-red/60 text-vexo-white hover:bg-vexo-red/10 hover:border-vexo-red',
      ghost:
        'bg-transparent text-vexo-muted hover:text-vexo-white hover:bg-white/5',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
      icon: 'p-2.5 text-sm rounded-full aspect-square',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
