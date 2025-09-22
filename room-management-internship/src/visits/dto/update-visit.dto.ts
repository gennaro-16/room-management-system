import { IsOptional, IsDateString, IsString, IsInt } from 'class-validator';

export class UpdateVisitDto {
  @IsOptional() @IsDateString() checkedOut?: string;
  @IsOptional() @IsString() purpose?: string;
  @IsOptional() @IsInt() bookingId?: number;
}