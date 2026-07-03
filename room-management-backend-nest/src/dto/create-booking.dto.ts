import { IsString, IsInt, IsOptional, IsDateString, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  roomId: number;

  @IsString()
  title: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  expectedAttendees: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internalAttendees?: string[];

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
}
