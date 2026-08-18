import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

const tabs = [
  { label: 'Chats', path: '/app/conversations', icon: MessageSquare },
  { label: 'Contacts', path: '/app/contacts', icon: Users },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/20 bg-background/90 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-20 max-w-lg items-stretch px-3">
        {tabs.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 pt-1.5 transition-colors',
                isActive ? 'border-t-2 border-primary text-primary' : 'text-text-secondary',
              )}
            >
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl',
                  isActive && 'bg-primary/10',
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
