import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { PassThrough } from 'stream';
import { promisify } from 'util';
import { doesNotMatch } from 'assert';

/**
 * Nosso teste da AuthService...
 */
describe('AuthService', () => {
  //serviço que vamos instanciar no beforeEach e que será usado em cada um dos testes.
  let service: AuthService;
  //nosso fake instanciado aqui para que eu possa mudar detalhes dele em cada teste.
  let fakeUsersService: Partial<UsersService>;
  /**
   * Aqui, antes de cada teste vamos usar a classe Test para criar um módulo da AuthService
   * e também criar um fake UsersService pois o AuthService depende
   * dele.
   *
   * O meu fakeUsersService tem 2 métodos que simulam os métodos reais e atuam com promises:
   * um find e outra create.
   * Ele é do tipo UsersService parcial pq só tenta (só precisa na verdade) criar alguns
   * dos vários métodos da UsersService.
   *
   *Na sequencia criamos o módulo e mandamos compilar.
   *
   * Por fim criamos um service e setamnos a expectativa para que seja
   * defined.
   *
   */
  beforeEach(async () => {
    //criamos um array para os users do fake. Vai ser nosso "fake db"...rsrsrs
    const users: User[] = [];

    fakeUsersService = {
      //nosso find sempre recebe um email então vamos buscar no nosso array de users
      //se há algum com esse email e retornar o primeiro encontrado.
      find: (email: string) => {
        const filtered = users.filter((user) => user.email === email);
        return Promise.resolve(filtered);
      },

      //nosso create recebe um email e um password e retorna um user que é inserido no nosso array de users.
      //assim posso testar signup e signin simplesmente criando um fake user e testando.
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 99999), email, password };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    /**
     * Nesse providers é onde colocamos a lista de coisas que queremos registrar no nosso
     * DI container de teste.
     * O 1º elemento lista o AuthService e, como ele depende de classes que estão em UsersService
     * em vez de instanciarmos ele indicamos (no 2º elemento do providers, que é um objeto) que
     * sempre que for solicitado algo de UsersService o teste deve usar os valores de fakeUsersService.
     *
     */
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    //Aqui, ao criar uma instância de AuthService as regras da dependência fake acima já
    //estarão vigorando.
    service = module.get(AuthService);
  });

  /**
   * Aqui meu teste propriamente dito, com o que espero de resultado.
   */
  it('Consegue criar uma instância de auth.service?', async () => {
    //Será defined pq estou garantindo dados no padrão do UsersService (fake) para o AuthService.
    expect(service).toBeDefined();
  });

  /**
   * Neste teste eu vou criar um novo user usando o método signup do meu UsersService.
   * Envio dados de teste para a criação e dou uma instrução de que salt e hash terão seus
   * valores vindos do split do retorno da senha no ponto.
   *
   * Depois defino 3 expectativas para que meu teste seja considerado OK.
   *
   */
  it('Cria uma novo usuário com senha usando salt e hash?', async () => {
    const user = await service.signup('test@test.com', '123456');
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('123456');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  /**
   * Aqui vamos verificar se tentar criar um usuário já existente retorna um erro.
   * Nosso find vai retornar um usuário de id1.
   * L´ano service, caso o length do find seja > 0 ele vai dar um throw BadRequestException
   * com a informação de email existente.
   *
   * Com essa lógica em mente aqui simulo esse signup em um bloco de try/catch
   * de forma simples já que não posso usar callback-done no it pois não posso
   * combinar async/await e done.
   *
   * Importante que aqui eu posso sobrepor o meu fakeUsersService.find com um objeto
   * contendo o user que posteriormente tentarei criar no teste entretanto vou simplesmente
   * usar o service.signup pra criar um usuário fora do try/catch e depois, dentro do bloco,
   * tentarei criar o mesmo usuário novamente.
   *
   * O esperado neste caso é um erro então o expect vai no catch espernado por uma
   * mensagem de erro com a mensagem de email existente que eu defini lá no service.
   *
   */
  it('Dá erro se tentar criar um usuário que já consta na base?', async () => {
    //deixei aqui o meu fakeUsersService.find como o que estava antes para referência.
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { id: 1, email: 'test@test.com', password: '123456' } as User,
    //   ]);
    await service.signup('tes@test.com', '123456');
    try {
      await service.signup('tes@test.com', '123456');
    } catch (error) {
      expect(error.message).toBe('Email já cadastrado...');
    }
  });

  /**
   * Teste para verificar erro no login.
   * Mesma lógica so signup com user existente: coloc meu expect no catch e
   * informo exatamente a msg de erro que defini no meu throw lá no service.
   *
   */
  it('Dá erro se tentar logar com usuário inexistente?', async () => {
    try {
      await service.signin('aaa@aaa.com', '123456');
    } catch (error) {
      expect(error.message).toBe('Usuário não existe!');
    }
  });

  /**
   * Teste para verificar erro no login caso a senha esteja errada.
   *
   * Neste caso eu crio o user e depois tento locgar com uma senha incorreta.
   * O esperado neste caso é um erro então o expect vai no catch espernado por uma
   * mensagem de erro com a mensagem de senha incorreta que eu defini lá no service.
   *
   */
  it('Interrompe o login se a senha estiver errada?', async () => {
    await service.signup('test@test.com', '123456');
    try {
      await service.signin('test@test.com', 'AAAAAAAAA');
    } catch (error) {
      expect(error.message).toContain('Senha incorreta!');
    }
  });

  /**
   * Aqui para testar o login, vamos criar um usuário fake e vamos usar o método
   * signin para tentar logar.
   * Primeiro crio um novo user, pego a senha com salt e hash e depois mando essa senha
   * para o fakeUsersService.
   *
   * Quando faço o login uso a senha de newUser pois o salt e hash estão OK no fakeUsersService.
   *
   */
  it('Retorna um usuário se a senha estiver correta?', async () => {
    await service.signup('test@test.com', '123456');
    const user = await service.signin('test@test.com', '123456');
    expect(user).toBeDefined();
  });
});
