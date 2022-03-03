import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {UsersModule} from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['a123456b'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Experimentos_em_NestJS')
    .setDescription('Meus experimentos com uma API usando Nest JS.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [UsersModule],
  });
  SwaggerModule.setup('doc', app, document);

  await app.listen(3000);

  console.log('Servidor rodando na porta 3000');
  
}
bootstrap();
