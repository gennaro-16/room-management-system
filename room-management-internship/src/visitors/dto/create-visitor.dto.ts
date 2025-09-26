import { IsString, IsOptional, IsEmail, IsPhoneNumber ,Matches} from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
@Matches(/^[0-9]{10}$/, { message: 'Phone must be 10 digits' })
  phone?: string;
}