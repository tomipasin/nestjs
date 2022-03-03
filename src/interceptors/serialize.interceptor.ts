import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Next,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { nextTick } from 'process';
import { UserDto } from 'src/users/dtos/user.dto';


/**
 * Aqui eu crio uma interface para que os meus DTOs 
 * só possam ser usados se o que for informado 
 * lá na controller seja uma classe. 
 * Caso não criasse essa interface e usasse um dto:any 
 * qualquer coisa  inserida como argumento ao chamar @Serialize(XXX) 
 * retornaria OK. 
 * Assim eu garanto que só classes possam ser usadas. 
 * 
 */
interface ClassConstructor {
  new (...args: any[]): {}
}



/**
 * Decorators nad amais são do que funções então criei esse. 
 * 
 * @param dto 
 * @returns 
 */
export function Serialize(dto:ClassConstructor){
  return UseInterceptors(new SerializeInterceptor(dto));
}


/**
 * Interceptar tanto a requisição quanto a resposta.
 * plainToClass garante que o meu data esteja nos parâmetros
 * do UserDto. Ao serializar ele vai considerar só o que 
 * estiver com @Expose() lá no UserDto pra enviar na resposta.
 * o construtor com dto:any permite que eu use vários DTOs 
 * para interceptar minhas respostas. 
 * 
 */
export class SerializeInterceptor implements NestInterceptor {

  constructor(private dto:any){}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        })
      }),
    );
  }
}
