import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { compareSync } from 'bcrypt';

const USER_RECORD: User = {
  id: 1,
  name: 'Alex',
  email: 'test@example.com',
  password: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CREATE_USER_DTO = {
  name: 'Alex',
  email: 'test@example.com',
  password: 'test',
};

const UPDATE_USER_DTO = {
  name: 'Alex II',
  email: 'test2@example.com',
  password: 'test2',
};

const CONFLICT_EXCEPTION_MESSAGE = 'User already exists';
const NOT_FOUND_EXCEPTION_MESSAGE = 'User was not found';

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
    await repository.insert(USER_RECORD);

    expect(await controller.findAll()).toEqual([USER_RECORD]);
  });

  it('should return User for findOne', async () => {
    await repository.insert(USER_RECORD);

    expect(await controller.findOne({ id: USER_RECORD.id })).toEqual(
      USER_RECORD,
    );
  });

  it('should return null for findOne', async () => {
    expect(await controller.findOne({ id: USER_RECORD.id })).toEqual(null);
  });

  it('should return User for create', async () => {
    const user = await controller.create(CREATE_USER_DTO);

    expect(user.email).toBe(CREATE_USER_DTO.email);
    expect(user.name).toBe(CREATE_USER_DTO.name);

    expect(user.id).toBe(1);
    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();

    expect(compareSync(CREATE_USER_DTO.password, user.password)).toBe(true);
  });

  it('should throw ConflictException for create', async () => {
    await repository.insert(CREATE_USER_DTO);

    await expect(controller.create(CREATE_USER_DTO)).rejects.toThrow(
      new ConflictException(CONFLICT_EXCEPTION_MESSAGE),
    );
  });

  it('should return User for update', async () => {
    await repository.insert(USER_RECORD);

    const user = await controller.update(
      { id: USER_RECORD.id },
      UPDATE_USER_DTO,
    );

    expect(user.email).toBe(UPDATE_USER_DTO.email);
    expect(user.name).toBe(UPDATE_USER_DTO.name);

    expect(user.id).toBe(1);
    expect(user.createdAt).toStrictEqual(USER_RECORD.createdAt);
  });

  it('should throw NotFoundException for update', async () => {
    await expect(controller.update({ id: 1 }, UPDATE_USER_DTO)).rejects.toThrow(
      new NotFoundException(NOT_FOUND_EXCEPTION_MESSAGE),
    );
  });

  it('should return void for remove', async () => {
    await repository.insert(USER_RECORD);

    expect(await controller.remove({ id: USER_RECORD.id })).toBeFalsy();
    expect(await controller.findAll()).toEqual([]);
  });

  it('should throw NotFoundException for remove', async () => {
    await expect(controller.remove({ id: 1 })).rejects.toThrow(
      new NotFoundException(NOT_FOUND_EXCEPTION_MESSAGE),
    );
  });
});
