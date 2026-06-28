import { IsOptional, IsNumber, IsObject, IsBoolean, IsString, Min } from 'class-validator';

export class UpdateMoodItemDto {
  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
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
  @IsOptional()
  content?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  style?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  locked?: boolean;

  @IsString()
  @IsOptional()
  groupId?: string | null;
}