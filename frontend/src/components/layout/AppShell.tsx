import { Link } from 'react-router-dom';
import { MessageSquare, Settings, Users } from 'lucide-react';
import { LogoWithText } from '../ui/Logo';
import { cn } from '../../utils/cn';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  activePath?: string;
}

const sidebarLinks = [
  { label: 'Chats', path: '/app/conversations', icon: MessageSquare },
  { label: 'Contacts', path: '/app/contacts', icon: Users },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export function AppShell({ children, activePath }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/20 bg-background md:flex lg:w-72">
        <div className="flex h-16 items-center border-b border-border/10 px-6">
          <Link to="/">
            <LogoWithText />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {sidebarLinks.map(({ label, path, icon: Icon }) => {
            const isActive = activePath?.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col pb-20 md:pb-0">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
