import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}