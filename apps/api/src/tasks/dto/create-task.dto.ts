import { IsOptional, IsString, IsEnum, IsISO8601 } from 'class-validator';
import { BriefType, BriefPriority } from '@repo/types';

export class CreateTaskDto {
  @IsString()
  projectId: string;

  @IsString()
  designerId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BriefType)
  briefType?: BriefType;

  @IsOptional()
  @IsEnum(BriefPriority)
  priority?: BriefPriority;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
