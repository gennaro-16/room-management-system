import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum RoomStatus {
  FREE = 'FREE',
  BUSY = 'BUSY',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
