import { IsDateString, IsString, IsOptional } from 'class-validator';
import { CreateBookingDto } from '../../dto/create-booking.dto';

export class CreateVisitForVisitorDto {
  @IsDateString()
  checkedIn: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  booking?: CreateBookingDto;
}
