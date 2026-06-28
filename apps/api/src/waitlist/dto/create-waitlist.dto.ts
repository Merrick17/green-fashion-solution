import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateWaitlistDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  brand: string;
}
