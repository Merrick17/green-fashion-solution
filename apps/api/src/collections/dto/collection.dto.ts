import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** Id of a CollectionItem to use as the cover. Pass null to clear. */
  @IsOptional()
  @IsString()
  coverItemId?: string | null;
}

export class AddCollectionItemDto {
  @IsOptional()
  @IsString()
  fabricAssetId?: string;

  @IsOptional()
  @IsString()
  productAssetId?: string;

  @IsOptional()
  position?: number;
}

/** Ordered list of CollectionItem ids; positions are assigned 0..n-1. */
export class ReorderCollectionItemsDto {
  @IsArray()
  @IsString({ each: true })
  itemIds!: string[];
}