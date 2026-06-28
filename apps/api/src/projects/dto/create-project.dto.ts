import { IsString, IsOptional, IsDateString, IsInt, Min, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

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
