import { IsEnum, IsOptional, IsString, IsInt, IsBoolean, Min, MinLength, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BriefOptionType } from '@prisma/client';

export class ListBriefOptionsQueryDto {
  @IsOptional()
  @IsEnum(BriefOptionType)
  type?: BriefOptionType;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeInactive?: boolean;
}

export class CreateBriefOptionDto {
  @IsEnum(BriefOptionType)
  type!: BriefOptionType;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateBriefOptionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
