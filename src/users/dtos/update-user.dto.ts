import  {IsEmail, IsString, IsOptional} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * O @ApiPropertyOptional no caso indica NA DOCUMENTAÇÃO que o campo não é obrigatório. 
 * O @IsOptional indica para o sistema a mesma coisa. 
 */
export class UpdateUserDto {
    @ApiPropertyOptional({
        description: 'Email que substituirá o atual.'
    })
    @IsEmail()
    @IsOptional()
    email: string;
    @ApiPropertyOptional({
        description: 'Senha que substituirá a atual.'
    })
    @IsString()
    @IsOptional()
    password: string;
}