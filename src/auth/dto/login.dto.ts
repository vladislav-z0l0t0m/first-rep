import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'test@example.com'})
    @IsEmail()
    email: string;

    @ApiProperty({ example: '4444'})
    @IsString()
    password: string;
}