import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/reports.entity'

/**
 * Aqui no nosso AppModule configuramos o TypeORM que, neste caso,
 * está usando um db.sqlite mesmo. No futuro faço algo mais consistente
 * com SQL server, Mongou ou algo parecido. 
 * 
 * Além do TypeORM importamos tbm o Users e Reports Module, Controller(s) e providers. 
 */
@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'bd.sqlite',
    entities: [User, Report],
    synchronize: true
  }),
  UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
