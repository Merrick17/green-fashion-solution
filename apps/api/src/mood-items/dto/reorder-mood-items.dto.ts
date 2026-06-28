import { IsArray, IsString } from 'class-validator';

export class ReorderMoodItemsDto {
  @IsArray()
  @IsString({ each: true })
  itemIds!: string[];
}