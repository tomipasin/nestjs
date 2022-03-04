import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";


/**
 * Esse AuthGuard vai verificar se o ID do usuário logado pode ou 
 * não acessar funções do sistema. 
 * Qualquer valor falsy não vai permitir acesso, retornando um 403. 
 * 
 * Posso implementaro @UseGuards(AuthGuard) a um modulo 
 * ou a toda uma controller. 
 */
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        return request.session.id;
    }
}