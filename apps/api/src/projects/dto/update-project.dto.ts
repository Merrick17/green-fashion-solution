import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, IsArray } from 'class-validator';
import { ProjectStatus } from '@repo/types';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  budgetBand?: string;

  @IsOptional()
  @IsDateString()
  targetDelivery?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  moq?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  garmentCategories?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  targetPricePointMillimes?: number;

  @IsOptional()
  @IsString()
  sustainabilityRequirements?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
