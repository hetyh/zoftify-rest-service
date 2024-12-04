import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword(undefined, {
    message:
      'Password must contain 8 characters minimum ' +
      'and have at least one uppercase letter and one special symbol',
  })
  password: string;

  @IsNotEmpty()
  name: string;
}
