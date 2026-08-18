import { MessageCircle } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'size-10', icon: 'size-5' },
    md: { box: 'size-16', icon: 'size-6' },
    lg: { box: 'size-12', icon: 'size-6' },
  };

  const { box, icon } = sizes[size];

  return (
    <div
      className={`${box} flex items-center justify-center rounded-2xl bg-primary-light shadow-[0px_1px_1px_rgba(0,0,0,0.05)]`}
    >
      <MessageCircle className={`${icon} text-white`} fill="white" />
    </div>
  );
}

export function LogoText({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-primary ${className}`}>NexusChat</span>
  );
}

export function LogoWithText({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size="sm" />
      <LogoText className="text-[32px]" />
    </div>
  );
}
