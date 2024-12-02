import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from './auth.module';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

const jwtModuleConfig = {
  secretOrKeyProvider: (requestType: JwtSecretRequestType) =>
    requestType === JwtSecretRequestType.SIGN ? 'sign_secret' : 'verify_secret',
  secret: 'default_secret',
  publicKey: 'public_key',
  privateKey: 'private_key',
};

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  let moduleRef: TestingModule;
  let signSpy: jest.SpyInstance;

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
        JwtModule.register(jwtModuleConfig),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    repository = moduleRef
      .get<UsersService>(UsersService)
      .dataSource.getRepository(User);

    signSpy = jest
      .spyOn(jwt, 'sign')
      .mockImplementation((token, secret, options, callback) => {
        const result = 'signed';
        return callback ? callback(null, result) : result;
      });
  });

  afterEach(() => {
    signSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return JWT for signIn', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: '$2b$11$QrwHzXfvx7CwkVQjL9Nra.v7WIMTdJNvZhhhQTa0a8NVcIdm/Kt0S', // "test"
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.insert(userData);

    const result = await service.signIn(userData.email, 'test');

    expect(result.access_token).toBe('signed');
  });

  it('should throw UnauthorizedException (no user) for signIn', async () => {
    await expect(service.signIn('test@example.com', 'test')).rejects.toThrow(
      new UnauthorizedException('Provided login data is incorrect'),
    );
  });

  it('should throw UnauthorizedException (wrong password) for signIn', async () => {
    const userData: User = {
      id: 1,
      name: 'Alex',
      email: 'test@example.com',
      password: '$2b$11$QrwHzXfvx7CwkVQjL9Nra.v7WIMTdJNvZhhhQTa0a8NVcIdm/Kt0S', // "test"
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.insert(userData);

    await expect(service.signIn('test@example.com', 'wrong')).rejects.toThrow(
      new UnauthorizedException('Provided login data is incorrect'),
    );
  });
});
