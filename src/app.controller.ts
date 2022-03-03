import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';


/**
 * Essa controller do app é padrão então só uso ela pra chamar um 
 * testAPI e vericiar se está tudo OK. 
 * nada de mais... Nossa lógica não será feita aqui e sim nas controllers
 * personalizadas para User e Report. 
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.testAPI();
  }
}
