import { IsOptional, IsEnum, IsInt, IsString, IsDateString, Min } from 'class-validator';
import { SamplingStatus } from '@prisma/client';

export class UpdateProposalItemDto {
  @IsOptional()
  @IsEnum(SamplingStatus)
  samplingStatus?: SamplingStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  confirmedQty?: number;

  @IsOptional()
  @IsString()
  confirmedColorway?: string;

  @IsOptional()
  @IsDateString()
  deliveryEta?: string;
}
