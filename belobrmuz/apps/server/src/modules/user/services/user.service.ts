import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailConfirmation } from '../models/email-confirmation.model';
import { DataSource, Repository } from 'typeorm';
import { async } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    @InjectRepository(EmailConfirmation)
    private emailConfirmationRepository: Repository<EmailConfirmation>,
    private dataSource: DataSource
  ) {}

  async create(createUserDto: CreateUserDto, confirmationToken: string) {
    const user = await this.userRepository.save(createUserDto);
    const emailConfirmation = this.emailConfirmationRepository.create({
      confirmationToken,
    });
    user.emailConfirmation = emailConfirmation;
    emailConfirmation.user = user;
    await this.emailConfirmationRepository.save(emailConfirmation);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async findByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findByVerificationToken(verificationToken: string) {
    return this.userRepository.findByConfirmationToken(verificationToken);
  }

  async findUnverified() {
    return this.userRepository.findUnverified();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  async updateConfirmationStatus(user: User, isConfirmed: boolean) {
    user.emailConfirmation.isConfirmed = isConfirmed;
    user.emailConfirmation.confirmationToken = null;
    await this.emailConfirmationRepository.save(user.emailConfirmation);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    const emailConfirmation = user.emailConfirmation;
    user.emailConfirmation = null;
    await this.userRepository.save(user);
    await this.emailConfirmationRepository.remove(emailConfirmation);
    return this.userRepository.remove(user);
  }
}
