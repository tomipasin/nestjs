import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Session
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { User } from './user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
    ) {}


  /**
   * Aqui uso o AuthService para tratar do signup e sign in.
   * O @Session trata dos cookies. 
   *  
   */  
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session:any) {
    //valida o corpo em relação ao DTO. 
    const user =  await this.authService.signup(body.email, body.password);
    //insere o valor do user.id no session.id para fins de tratamento de cookies.
    session.id = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session:any ){
    const user = await this.authService.signin(body.email, body.password);
    session.id = user.id;
    return user;
  }

  @Get('/whoami')
  whoAmI(@Session() session: any){
    return this.usersService.findOne(session.id);
  }

  @Post('/signout')
  signOut(@Session() session: any){
    const sign = session.id = null;
    return 'Usuário deslogado com sucesso!'
  }


  /**
   * embora id seja number na nossa app tudo que vêm do navegador é string.
   * pra contornar uso parseInt na hora de chamar o serviço.
   *
   * Aqui também faço a inserção de um NotFoundException na controller
   * pq buscar um ID e não achar é uma característica normal deste endpoint
   * entretanto quero que ao não achar ele retorne um 404 e uma mensagem.
   * Se fizesse isso no service não teria este resultado  caso fosse reutilizar
   * este código em outras controllers.
   *
   * Uso o UseInterceptors desta forma para habilitar os interceptors
   * criados.
   * Para que possamos usar vários DTOs (para vários tipos de daddos) de forma geral na controller
   * instanciamos meu decorator Serialize criado lá no serialize unsando como argumento o DTO
   * desejado logo abaixo do instanciamento da controller. Assim ele se aplica a toda ela.
   * Se quisesse somente a algum handler usaria, por exemplo, logo acima do @GET, @POST, etc.
   * Lá no serialize.interceptors colocaremos um construtor como dto:any.
   *
   * Decorators são funções.
   *
   */

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('Não achei o cidadão...');
    }
    return user;
  }

  /**
   * No caso de uma query uso o decorator @Query e
   * NÃO USO A ROTA NO @Get pois o decorator de query faz
   * isso automaticamente.
   * No service indiquei que caso não seja informado um email
   * ele vai listar todos os registros em ordem ascendente de
   * ID.
   *
   * @param email
   * @returns
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  @Post('/colors/:color')
  setColor(@Param('color') color: string, @Session() session: any){
    session.color = color;
  }

  @Get('/colors/all')
  getColor(@Session() session:any){
    console.log(session);

    return session.color;
  }
}