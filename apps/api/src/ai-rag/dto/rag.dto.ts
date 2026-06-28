import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RagChunkDto {
  @IsString()
  sourceKey!: string;

  @IsString()
  content!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  embedding!: number[];

  @IsString()
  model!: string;
}

export class UpsertRagChunksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RagChunkDto)
  chunks!: RagChunkDto[];
}

export class RagSearchDto {
  @IsArray()
  @IsNumber({}, { each: true })
  queryEmbedding!: number[];

  @IsOptional()
  @IsNumber()
  topK?: number;
}
