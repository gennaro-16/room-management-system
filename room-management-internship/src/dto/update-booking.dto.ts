import { IsString, IsInt, IsOptional, IsDateString, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  expectedAttendees?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  internalAttendees?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  externalAttendees?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredAmenities?: string[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
