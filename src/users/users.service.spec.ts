import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users.module';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { compareSync } from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
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

    service = moduleRef.get<UsersService>(UsersService);
    repository = service.dataSource.getRepository(User);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    expect(await service.findAll()).toEqual([userData]);
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

    expect(await service.findOne({ id: 1 })).toEqual(userData);
  });

  it('should return null for findOne', async () => {
    expect(await service.findOne({ id: 1 })).toEqual(null);
  });

  it('should return User for create', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Alex',
      email: 'test@example.com',
      password: 'test',
    };

    const user = await service.create(createUserDto);

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

    await expect(service.create(createUserDto)).rejects.toThrow(
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

    const user = await service.update(userData.id, updateUserDto);

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

    await expect(service.update(1, updateUserDto)).rejects.toThrow(
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

    expect(await service.remove(userData.id)).toBeFalsy();
    expect(await service.findAll()).toEqual([]);
  });

  it('should throw NotFoundException for remove', async () => {
    await expect(service.remove(1)).rejects.toThrow(
      new NotFoundException('User was not found'),
    );
  });
});
