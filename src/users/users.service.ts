import { Injectable, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  //injeção de dependência.
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  findOne(id: number) {
    if(!id){
      return null;
    }
    return this.repo.findOne(id);
  }

  find(email: string) {
    if (!email) {
      return this.repo.find({
        order: {
          id: 'ASC',
        },
      });
    }
    return this.repo.find({ email });
  }

  /**
   * Aqui, como não sei o que vai ser atualizado no user de id X
   * uso um argumento attrs de tipo Partial<User> o que siginifica que
   * ele aceitará qualquer tipo de parâmetro (todos, um deles ou nenhum
   * deles) que pertença à nossa entidade User.
   *
   * Para este processo usarei o serviço findOne e depois
   * Object.assign com os attrs para sobrescrever as modificações
   * em user e em seguida salvar.
   * Uso save em vez de update pois quero preservar a execução dos
   * hooks lá no user.entity.
   * 
   * Uso aqui o NotFoundException no lugar do Throw new Error por
   * ser uma forma de lidar com um not found mais adaptada pelo Nest.
   *
   * @param id
   * @param attrs
   */
  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('Não achei este usuário...');
    }

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  /**
   * Para a remoção farei a mesma coisa: busco pelo ID e
   * depois uso remove() para preservar a execução dos
   * hooks lá na entity.
   *
   *
   * @param id
   * @returns
   */
  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Não achei esse vivente...');
    }
    return this.repo.remove(user);
  }

}
