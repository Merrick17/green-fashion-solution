import { IsString, IsOptional } from 'class-validator';

// The snapshot `document` is built server-side from the current canvas state
// (moodboard metadata + items + viewport). Clients only pass an optional
// human-readable summary to label the capture.
export class CreateMoodboardSnapshotDto {
  @IsString()
  @IsOptional()
  aiSummary?: string;
}