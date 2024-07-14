import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class SigninUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
