import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { EmailConfirmation } from './email-confirmation.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  refreshToken: string;

  @OneToOne(() => EmailConfirmation)
  @JoinColumn()
  emailConfirmation: EmailConfirmation;
}
