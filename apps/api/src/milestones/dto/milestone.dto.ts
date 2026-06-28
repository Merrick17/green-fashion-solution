import { IsString, IsBoolean, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { MilestoneType } from '@prisma/client';

export class CreateMilestoneDto {
  @IsString()
  projectId!: string;

  @IsString()
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsEnum(MilestoneType)
  type?: MilestoneType;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsEnum(MilestoneType)
  type?: MilestoneType;
}
