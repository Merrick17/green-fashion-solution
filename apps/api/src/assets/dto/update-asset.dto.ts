import { IsArray, IsOptional, IsString, IsObject, IsInt, Min, IsEnum } from 'class-validator';
import { AvailabilityStatus } from '@prisma/client';

export class UpdateFabricAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsString()
  composition?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  moq?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerUnitMillimes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasons?: string[];

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;
}

export class UpdateProductAssetDto extends UpdateFabricAssetDto {}
