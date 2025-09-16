import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, IsInt } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  departmentId: number;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
