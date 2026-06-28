import { IsEmail, IsString, IsEnum } from 'class-validator';
import { ProjectType, BudgetRange } from '@repo/types';

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsEmail()
  email: string;

  @IsEnum(ProjectType)
  projectType: ProjectType;

  @IsEnum(BudgetRange)
  budgetRange: BudgetRange;
}