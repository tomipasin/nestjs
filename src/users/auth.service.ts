import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

/**
 * Essa classe é responsável pela parte de criação de ususário e
 * posterior autenticação.
 * Uso aqui o método de hash+salt para implementar
 * segurança adicional ao meu sistema.
 * Assim mesmo que o usuário tenha uma senha que já está exposta
 * em alguma rainbow table com a adição do salt ao hash
 * será praticamente impossível usar um dado armazenado no meu DB
 * para descobrir a senha a que se refere.
 *
 */
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  //método de sign up
  async signup(email: string, password: string) {
    //1 - verificar se o email já está em uso:
    const users = await this.usersService.find(email); //o retorno é um array.
    if (users.length) {
      throw new BadRequestException('Email já cadastrado...');
    }

    //2 - hash a senha do usuário:

    //2.1 - gera uma cadeia de caracteres do tamanho de 8 bytes que usaremos como salt.
    const salt = randomBytes(8).toString('hex');

    //2.2 - faz o hash da senha + salt e retorna só 32 caracteres.
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //2.3 - juntar tudo usando um separador para identificar o hash e o salt.
    const result = salt + '.' + hash.toString('hex');

    //3 - criar o usuário e salvar ele já com a var result no lugar da senha:
    const user = await this.usersService.create(email, result);

    //4 - retornar o user criado.
    return user;
  }

  //método de login:
  async signin(email: string, password: string) {
    //1 - localizar o user no db:
    const [user] = await this.usersService.find(email); //retorna um array então estou desestruturando.
    if (!user) {
      throw new NotFoundException('Usuário não existe!');
    }

    //2 - com base no user retornado do db vamos separar quem é hash e quem é salt desestruturando mais uma vez.
    const [salt, storedHash] = user.password.split('.');

    //3 - aqui faço mais uma vez o processo de hash retornando só 32 char.
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //4 - e verifico a igualdade entre o storedHash (DB) e o hash criado agora com os dados de pwd do user:
    if (storedHash === hash.toString('hex')) {
      return user;
    } else {
      throw new BadRequestException('Senha incorreta!!!');
    }
  }
}
