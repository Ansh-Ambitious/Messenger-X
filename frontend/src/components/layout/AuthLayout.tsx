import { Link } from 'react-router-dom';
import { LogoText } from '../ui/Logo';
import { cn } from '../../utils/cn';

interface AuthLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  showHeaderLogo?: boolean;
}

export function AuthLayout({
  children,
  showBack = false,
  backTo,
  showHeaderLogo = false,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {(showBack || showHeaderLogo) && (
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border/10 bg-background/80 px-4 backdrop-blur-md md:px-6">
          {showBack && (
            <Link
              to={backTo ?? '/login'}
              className="flex size-10 items-center justify-center rounded-full text-text-primary hover:bg-surface"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
          {showHeaderLogo && (
            <div className="mx-auto">
              <LogoText className="text-xl" />
            </div>
          )}
        </header>
      )}

      <main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/20 bg-background p-6 shadow-[0px_4px_12px_rgba(0,88,188,0.05)] md:p-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
