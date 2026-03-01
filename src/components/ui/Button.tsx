import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-[#0F2027] text-white hover:bg-[#203A43]',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
            outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
            danger: 'bg-red-600 text-white hover:bg-red-700',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
