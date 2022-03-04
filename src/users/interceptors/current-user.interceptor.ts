import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

/**
 * Aqui cria uma classe injetável (Dependence Injection) e
 * implemento um interceptor que fará uso do método findOne da
 * UsersService para localizar no DB quem é o uusário com o id X
 * que está fazendo a requisição.
 * O user que for encontrado é atribuido a request.currentUser
 * e será retornado lá no decorator.
 */
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const { id } = request.session || {};
    if (id) {
      const user = await this.usersService.findOne(id);
      request.currentUser = user;
    }
    return next.handle();
  }
}
