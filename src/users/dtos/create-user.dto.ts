import  {IsEmail, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Aqui nos Data Transfer Objects definimos tudo que vai e como vai ser
 * devolvido nas requisições. 
 * 
 * Nesta de create user definimos os campos que deve conter o corpo para
 * que o sistema funcione. 
 * 
 * O Class Validator ajuda a verificar os dados para que estejam no formato correto.
 * 
 * Também usamso uns decorators para melhorar a doc da API. 
 */
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