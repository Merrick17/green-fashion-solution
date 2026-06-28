import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BriefFormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function BriefFormField({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: BriefFormFieldProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-portal-foreground"
      >
        {label}
        {required ? (
          <>
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </Label>
      {children}
      {hint ? (
        <p className="text-sm leading-relaxed text-muted-foreground leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}
