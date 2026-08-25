import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export function BackButton({ to, className }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={cn(
        'flex size-10 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface',
        className,
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="size-4" />
    </button>
  );
}
