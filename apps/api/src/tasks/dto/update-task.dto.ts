import { IsOptional, IsString, IsEnum, IsISO8601 } from 'class-validator';
import { TaskStatus, BriefType, BriefPriority } from '@repo/types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BriefType)
  briefType?: BriefType;

  @IsOptional()
  @IsEnum(BriefPriority)
  priority?: BriefPriority;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}

export class TaskListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(BriefType)
  briefType?: BriefType;

  @IsOptional()
  @IsEnum(BriefPriority)
  priority?: BriefPriority;
}
