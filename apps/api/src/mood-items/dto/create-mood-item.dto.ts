import { IsString, IsEnum, IsOptional, IsNumber, IsObject, IsBoolean, Min } from 'class-validator';
import { MoodItemType } from '@repo/types';

export class CreateMoodItemDto {
  @IsEnum(MoodItemType)
  type!: MoodItemType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  x?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  y?: number;

  @IsNumber()
  @Min(50)
  @IsOptional()
  width?: number;

  @IsNumber()
  @Min(50)
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsNumber()
  @IsOptional()
  zIndex?: number;

  @IsObject()
  content!: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  style?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  locked?: boolean;

  @IsString()
  @IsOptional()
  groupId?: string;
}