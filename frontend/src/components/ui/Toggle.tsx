import { cn } from '../../utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-[#e1e2e7]',
        className,
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-4 rounded-full bg-text-primary shadow transition-transform',
          checked ? 'left-[calc(100%-1.25rem)] bg-white' : 'left-1',
        )}
      />
    </button>
  );
}
