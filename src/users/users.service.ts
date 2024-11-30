import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (user) {
      throw new ConflictException('User already exists');
    }

    return this.userRepository.save(createUserDto);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return this.userRepository.save({ ...user, ...updateUserDto });
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    await this.userRepository.delete({ id });
  }
}
