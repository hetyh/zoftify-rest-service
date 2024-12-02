import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync } from 'bcrypt';

describe('UsersController', () => {
  let controller: UsersController;
  let repository: Repository<User>;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        }),
        UsersModule,
      ],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
    repository = moduleRef
      .get<UsersService>(UsersService)
      .dataSource.getRepository(User);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return User[] for findAll', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.insert(userData);

    expect(await controller.findAll()).toEqual([userData]);
  });

  it('should return User for findOne', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.insert(userData);

    expect(await controller.findOne({ id: 1 })).toEqual(userData);
  });

  it('should return null for findOne', async () => {
    expect(await controller.findOne({ id: 1 })).toEqual(null);
  });

  it('should return User for create', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
    };

    const user = await controller.create(createUserDto);

    expect(user.email).toBe(createUserDto.email);
    expect(user.name).toBe(createUserDto.name);

    expect(user.id).toBe(1);
    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();

    expect(compareSync(createUserDto.password, user.password)).toBe(true);
  });

  it('should throw ConflictException for create', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
    };

    await repository.insert(createUserDto);

    await expect(controller.create(createUserDto)).rejects.toThrow(
      new ConflictException('User already exists'),
    );
  });

  it('should return User for update', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateUserDto: UpdateUserDto = {
      name: 'Alex II',
      email: 'test2@example.com',
      password: 'test2',
    };

    await repository.insert(userData);

    const user = await controller.update({ id: userData.id }, updateUserDto);

    expect(user.email).toBe(updateUserDto.email);
    expect(user.name).toBe(updateUserDto.name);

    expect(user.id).toBe(1);
    expect(user.createdAt).toStrictEqual(userData.createdAt);
  });

  it('should throw NotFoundException for update', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Alex II',
      email: 'test2@example.com',
      password: 'test2',
    };

    await expect(controller.update({ id: 1 }, updateUserDto)).rejects.toThrow(
      new NotFoundException('User was not found'),
    );
  });

  it('should return void for remove', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.insert(userData);

    expect(await controller.remove({ id: userData.id })).toBeFalsy();
    expect(await controller.findAll()).toEqual([]);
  });

  it('should throw NotFoundException for remove', async () => {
    await expect(controller.remove({ id: 1 })).rejects.toThrow(
      new NotFoundException('User was not found'),
    );
  });
});
