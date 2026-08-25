import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';
import type { Conversation } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { participant, lastMessage, lastMessageTime, unreadCount, isActive } = conversation;
  const isGroup = participant.name.includes('Team') || participant.name.includes('Project');

  return (
    <Link
      to={`/app/chat/${conversation.id}`}
      className={cn(
        'relative flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/60',
        isActive && 'border border-border/20 bg-white shadow-[0px_2px_8px_-2px_rgba(0,0,0,0.05)]',
      )}
    >
      {isActive && (
        <span className="absolute bottom-2 left-0 top-2 w-0.75 rounded-r-full bg-primary" />
      )}

      {isGroup && !participant.avatar ? (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#d8e2ff]">
          <Briefcase className="size-5 text-primary" />
        </div>
      ) : (
        <Avatar
          user={participant}
          size="md"
          showOnline={!isGroup}
          isOnline={participant.isOnline}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-end justify-between gap-2">
          <h3 className="truncate text-base font-medium text-text-primary">{participant.name}</h3>
          <span
            className={cn(
              'shrink-0 text-[13px]',
              isActive || unreadCount ? 'text-primary' : 'text-text-muted',
            )}
          >
            {lastMessageTime}
          </span>
        </div>
        <p className="truncate text-[13px] text-text-secondary">{lastMessage}</p>
      </div>

      {unreadCount ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
