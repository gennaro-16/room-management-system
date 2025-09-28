import { IsString, IsOptional, IsInt, Min, Max, IsNull } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50) // Assuming max 50 floors
  floor?: number | null;
}
