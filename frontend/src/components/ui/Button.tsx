import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50',
        fullWidth && 'w-full',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-4 py-3 text-base',
        size === 'lg' && 'px-8 py-3 text-base',
        variant === 'primary' &&
          'bg-primary text-white shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.2)] hover:bg-[#004a9e]',
        variant === 'secondary' &&
          'border border-border bg-background text-text-primary hover:bg-surface',
        variant === 'outline' &&
          'border border-border bg-white text-text-primary hover:bg-background',
        variant === 'ghost' && 'text-primary hover:bg-primary/5',
        variant === 'danger' && 'text-error hover:bg-error/5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
