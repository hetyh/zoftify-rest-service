import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from './constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (user) {
      throw new ConflictException('User already exists');
    }

    const password = bcrypt.hashSync(createUserDto.password, 10);

    return this.userRepository.save({ ...createUserDto, password });
  }

  findAll(opts?: FindManyOptions<User>): Promise<User[]> {
    return this.userRepository.find(opts);
  }

  findOne(opts: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOneBy(opts);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    if (updateUserDto.email) {
      const user = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });

      if (user) {
        throw new ConflictException('Email is already in use');
      }
    }

    const password = updateUserDto.password
      ? { password: bcrypt.hashSync(updateUserDto.password, 10) }
      : {};

    return this.userRepository.save({ ...user, ...updateUserDto, ...password });
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    await this.userRepository.delete({ id });
  }
}
