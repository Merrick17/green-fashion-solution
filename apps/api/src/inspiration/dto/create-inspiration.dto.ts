import { IsString, IsEnum, IsOptional } from 'class-validator';
import { InspirationAction } from '@repo/types';

export class CreateInspirationSelectionDto {
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  fabricAssetId?: string;

  @IsOptional()
  @IsString()
  productAssetId?: string;

  @IsEnum(InspirationAction)
  action!: InspirationAction;
}
