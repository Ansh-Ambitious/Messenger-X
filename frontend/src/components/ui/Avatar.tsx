import { cn } from '../../utils/cn';
import type { User } from '../../types';

interface AvatarProps {
  user: Pick<User, 'name' | 'avatar'>;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'size-8 text-xs',
  md: 'size-12 text-base',
  lg: 'size-16 text-xl',
};

const initialsColors = [
  'bg-[#ffddb8] text-[#2a1700]',
  'bg-[#d8e2ff] text-primary',
  'bg-[#e7e8ec] text-text-secondary',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColorIndex(name: string) {
  return name.charCodeAt(0) % initialsColors.length;
}

export function Avatar({ user, size = 'md', showOnline, isOnline, className }: AvatarProps) {
  const initials = getInitials(user.name);

  return (
    <div className={cn('relative shrink-0', className)}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={cn('rounded-full object-cover', sizeMap[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-medium',
            sizeMap[size],
            initialsColors[getColorIndex(user.name)],
          )}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background',
            isOnline ? 'bg-online' : 'bg-text-muted',
          )}
        />
      )}
    </div>
  );
}
