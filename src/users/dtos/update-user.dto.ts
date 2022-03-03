import  {IsEmail, IsString, IsOptional} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


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