import  {IsEmail, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
    @ApiProperty({
        description: 'Email do usuário que será criado.'
    })
    @IsEmail()
    email: string;
    @ApiProperty({
        description: 'Senha do novo usuário.'
    })
    @IsString()
    password: string;
}