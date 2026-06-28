'use client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface UploadParseActionProps {
  parsing: boolean;
  disabled: boolean;
  onParse: () => void;
}
export function UploadParseAction({
  parsing,
  disabled,
  onParse,
}: UploadParseActionProps) {
  return (
    <Button onClick={onParse} disabled={disabled}>
      {parsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {parsing ? 'Reading…' : 'Read these references'}
    </Button>
  );
}
