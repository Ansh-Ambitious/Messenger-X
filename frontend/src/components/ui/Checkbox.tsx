import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? 'checkbox';

  return (
    <label htmlFor={checkboxId} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        id={checkboxId}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border border-border accent-primary"
        {...props}
      />
      <span className="text-sm leading-5 text-text-secondary">{label}</span>
    </label>
  );
}
