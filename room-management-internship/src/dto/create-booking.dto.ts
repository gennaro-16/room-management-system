import { IsString, IsInt, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  roomId: number;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
