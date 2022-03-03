import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';



/**
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
