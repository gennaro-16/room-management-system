import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50) // Assuming max 50 floors
  floor?: number;
}
