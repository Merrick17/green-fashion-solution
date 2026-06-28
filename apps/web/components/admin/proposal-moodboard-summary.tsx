'use client';
import type { AgentContextMoodboard } from '@repo/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface ProposalMoodboardSummaryProps {
  moodboards: AgentContextMoodboard[];
}
export function ProposalMoodboardSummary({
  moodboards,
}: ProposalMoodboardSummaryProps) {
  const board = moodboards[0];
  if (!board) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Moodboard signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Style: </span>
          {board.styleDirection}
        </div>
        <div>
          <span className="font-medium">Mood: </span> {board.mood}
        </div>
        {board.colorPalette.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Palette:</span>
            {board.colorPalette.map((color) => (
              <div
                key={color}
                className="h-5 w-5 "
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
        {board.fabricSuggestions.length > 0 && (
          <div>
            <span className="font-medium">Fabrics: </span>
            {board.fabricSuggestions.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
