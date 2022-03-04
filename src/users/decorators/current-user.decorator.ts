import {
    createParamDecorator,
    ExecutionContext
} from '@nestjs/common';

/**
 * O Execution Context abstrai websocket, http, etc.
 * Aqui ele simplesmente captura o request e retorna o 
 * usuário atual. 
 * A lógica disso é feita lá no interceptor.  
 * 
 */
export const CurrentUser = createParamDecorator((
    data:never, context: ExecutionContext
)=>{
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
})