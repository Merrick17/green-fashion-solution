import { IsString, IsISO8601, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  projectId: string;

  @IsISO8601()
  requestedAt: string;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  durationMinutes?: number;
}