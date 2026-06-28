import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ProposalStatus } from '@repo/types';

class ProposalItemDto {
  @IsOptional()
  @IsString()
  fabricAssetId?: string;

  @IsOptional()
  @IsString()
  productAssetId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  position?: number;
}

export class ProposalSectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposalItemDto)
  items: ProposalItemDto[];
}

export class CreateProposalDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  styleSummary?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposalSectionDto)
  sections: ProposalSectionDto[];
}
