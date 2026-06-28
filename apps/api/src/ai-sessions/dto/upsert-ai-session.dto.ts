import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertAiSessionDto {
  @IsArray()
  messages!: unknown[];

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
