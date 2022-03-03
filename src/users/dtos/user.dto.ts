import  {Expose} from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @Expose() indica os campos que serão expostos na serialização. 
 */
export class UserDto {
    @ApiProperty()
    @Expose()
    id: number;
    @ApiProperty()
    @Expose()
    email: string;
    @ApiProperty()
    // @Expose()
    password: string;
}