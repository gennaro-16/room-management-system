import { IsInt, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class CreateVisitDto {
  @IsInt()
  visitorId: number;

  @IsOptional()
  @IsInt()
  bookingId?: number;

  @IsISO8601()
  checkedIn: string;

  @IsOptional()
  @IsISO8601()
  checkedOut?: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}
