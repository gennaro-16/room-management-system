import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class MoveBookingDto {
  @IsInt()
  newRoomId!: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}


