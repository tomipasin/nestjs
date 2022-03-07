import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { PassThrough } from 'stream';

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
   * O find sempre vai retornar um array vazio. Se precisar de algo diferente preciso detalhar
   * em cada um dos testes.
   * O create sempre vai retornar id 1, email e senha (no caso caso como strings ;-) ).
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
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
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
   * Neste caso meu método find não pode retornar um array vazio e sim retornar um
   * usuário específico. Assim eu indico o que desejo de retorno no meu fakeUsersService
   * e depois uso no teste.
   */
  //   it('Consegue fazer login?', async () => {
  //     fakeUsersService.find = () =>
  //       Promise.resolve([{ id: 1, email: 'test@test.com', password: '123456' }]);
  //     const user = await service.signin('test@test.com', '123456');

  //     expect(user).toBe('test@test.com');
  //   });

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
   *
   */
  it('Dá erro se tentar criar um usuário que já consta na base?', async () => {
    //se o find encontrar qualquer coisa vai indicar email já cadastrado.
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@test.com', password: '123456' } as User,
      ]);

    try {
      await service.signup('test@test.com', '123456');
    } catch (error) {}
  });
});
