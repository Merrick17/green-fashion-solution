import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChangeRequestDto {
  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsString()
  sectionId?: string;
}
