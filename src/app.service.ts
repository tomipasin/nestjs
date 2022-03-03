import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  testAPI(): string {
    return 'API em NestJS funcionando corretamente!!!';
  }
}
