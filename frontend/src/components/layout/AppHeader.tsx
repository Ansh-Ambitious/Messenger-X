import { Link } from 'react-router-dom';
import { LogoWithText } from '../ui/Logo';

interface AppHeaderProps {
  title?: string;
  action?: React.ReactNode;
  showLogo?: boolean;
}

export function AppHeader({ title, action, showLogo = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/10 bg-background/80 px-4 backdrop-blur-md md:px-6">
      {showLogo ? (
        <Link to="/app/conversations">
          <LogoWithText />
        </Link>
      ) : (
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">{title}</h1>
      )}
      {action}
    </header>
  );
}
