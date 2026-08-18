import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text = 'Or', className }: DividerProps) {
  return (
    <div className={cn('relative flex items-center py-1', className)}>
      <div className="h-px flex-1 bg-border/30" />
      {text && (
        <span className="bg-background px-3 text-[13px] tracking-wide text-text-secondary">
          {text}
        </span>
      )}
      <div className="h-px flex-1 bg-border/30" />
    </div>
  );
}

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-[15px] text-text-secondary">
      {text}{' '}
      <Link to={to} className="font-medium text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
