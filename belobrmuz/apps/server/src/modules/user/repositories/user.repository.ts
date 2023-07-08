import { DataSource, Repository } from 'typeorm';
import { User } from '../models/user.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async findByConfirmationToken(token: string): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'confirmation')
      .where('confirmation.confirmationToken = :token', { token })
      .getOne();
  }

  async findUnverified(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoin('user.emailConfirmation', 'confirmation')
      .where('confirmation.isConfirmed = :isConfirmed', { isConfirmed: false })
      .getMany();
  }
}
