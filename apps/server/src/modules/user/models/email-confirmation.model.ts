import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.model';

@Entity('email_confirmations')
export class EmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  confirmationToken: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
