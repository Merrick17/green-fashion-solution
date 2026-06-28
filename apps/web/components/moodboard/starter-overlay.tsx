'use client';
import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface StarterOverlayProps {
  styleDirection: string;
  onStartGenerate: () => void;
}
export function StarterOverlay({
  styleDirection,
  onStartGenerate,
}: StarterOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex max-w-md flex-col items-center gap-4 px-6 text-center">
        <div className=" bg-primary/10 p-4">
          <LayoutGrid className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Start your moodboard</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Let your creative partner set up an initial layout for your
            <span className="font-medium text-foreground">
              {styleDirection}
            </span>
            direction. You can refine everything on the canvas afterward.
          </p>
        </div>
        <Button onClick={onStartGenerate}>Give me a starting point</Button>
      </div>
    </div>
  );
}
