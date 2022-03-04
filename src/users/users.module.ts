import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

/**
 * Aqui no módulo de User eu defino a controller,
 * os providers, interceptors e também o TypeORM para que ele crie
 * o repositório para nós de forma automática.
 * 
 * O objeto com o APP_Interceptors dentro de providers permite que 
 * um interceptor seja usado de forma global. 
 * Se eu só delcarasse o CurrentUserInterceptor no array de providers
 * eu teria que usar um @UseInterceptors(CurrentUserInterceptor) em 
 * cada controller do meu código. Impraticável!
 * Assim ela fica global e posso usar em qualquer parte do app. 
 * 
 * 
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class UsersModule {}
