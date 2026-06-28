import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import type { CanvasViewport } from '@repo/types';

export class UpdateMoodboardDto {
  @IsString()
  @IsOptional()
  styleDirection?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colorPalette?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fabricSuggestions?: string[];

  @IsString()
  @IsOptional()
  mood?: string;

  @IsObject()
  @IsOptional()
  canvasViewport?: CanvasViewport;
}