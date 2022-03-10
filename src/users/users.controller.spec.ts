import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';


describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    //faço o fake de tudo que preciso aquina controller.
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id, //retorna o ID que mandei buscar.
          email: 'testefindone@test.com',
          password: '123456',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email, //retorna o email que mandei buscar.
            password: '123456',
          },
        ]);
      },
    //   remove: () => {},
    //   update: () => {},
    // };
    // fakeAuthService = {
    //   signup: () => {},
    //   signin: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
