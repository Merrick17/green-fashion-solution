import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageThreadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @MinLength(1)
  body!: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;
}
