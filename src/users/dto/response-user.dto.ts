import { IsUUID, IsDate, IsString, IsEmail } from 'class-validator';

export class UserResponseDto {
    @IsUUID()
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;
}
