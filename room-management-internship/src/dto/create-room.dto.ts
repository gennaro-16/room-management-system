import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(100)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  x?: number;

  @IsOptional()
  @IsInt()
  y?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}
