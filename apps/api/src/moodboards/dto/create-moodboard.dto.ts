import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateMoodboardDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  styleDirection!: string;

  @IsArray()
  @IsString({ each: true })
  colorPalette!: string[];

  @IsArray()
  @IsString({ each: true })
  fabricSuggestions!: string[];

  @IsString()
  @IsNotEmpty()
  mood!: string;
}
