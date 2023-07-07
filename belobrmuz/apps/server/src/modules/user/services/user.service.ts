import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: number) {
    return this.userRepository.findOneBy({id});
  }

  async findByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    return this.userRepository.delete(id);
  }
}
