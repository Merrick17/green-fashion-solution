import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDesignerApplicationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class ApproveDesignerApplicationDto {
  @IsString()
  @MinLength(8)
  password: string;
}
