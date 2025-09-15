import { IsString, IsInt, IsOptional, Min, Max, IsArray, IsBoolean } from 'class-validator';

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

  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsInt()
  floor: number;

  @IsOptional()
  @IsString()
  building?: string;

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

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsBoolean()
  isUnderMaintenance?: boolean;

  @IsOptional()
  @IsString()
  maintenanceNotes?: string;
}
