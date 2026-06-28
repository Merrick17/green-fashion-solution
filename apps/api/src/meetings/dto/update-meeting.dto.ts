import { IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { MeetingStatus } from '@repo/types';

export class UpdateMeetingDto {
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}