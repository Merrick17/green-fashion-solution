import { IsArray, ValidateNested, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ItemUpdate {
  @IsString()
  id!: string;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @Min(50)
  @IsOptional()
  width?: number;

  @IsNumber()
  @Min(50)
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsNumber()
  @IsOptional()
  zIndex?: number;
}

export class BatchUpdateMoodItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemUpdate)
  updates!: ItemUpdate[];
}