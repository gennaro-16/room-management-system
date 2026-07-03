import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApproveUserDto {
  @IsBoolean()
  isApproved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
