import { IsString, IsEmail, IsOptional, IsInt, Min, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVisitorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateVisitorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateVisitForVisitorDto {
  @IsDateString()
  checkedIn: string; // ISO string

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsInt()
  bookingId?: number;
}

export enum VisitStatus {
  active = 'active',
  checkedout = 'checkedout',
  all = 'all',
}

export class FilterVisitorsDto {
  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}