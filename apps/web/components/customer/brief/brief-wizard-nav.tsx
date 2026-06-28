import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface BriefWizardNavProps {
  step: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  isLoading?: boolean;
}
export function BriefWizardNav({
  step,
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
  showBack = step > 1,
  isLoading,
}: BriefWizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
      {showBack && onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Button
          type="button"
          size="sm"
          onClick={onNext}
          disabled={nextDisabled || isLoading}
        >
          {nextLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
