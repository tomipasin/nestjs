import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';



/**
 * Uso o decorator Exclude para remover o retorno de password no objeto
 * ao consultar User.
 * Precisa criar um interceptor na controller. 
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
  
  @Column()
  password: string;
}
