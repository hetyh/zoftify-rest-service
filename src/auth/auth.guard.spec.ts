import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../common/decorators';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { DATA_SOURCE } from '../database/constants';

const USER_RECORD: User = {
  id: 1,
  name: 'Alex',
  email: 'test@example.com',
  password: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const VALID_TOKEN = 'valid_token';
const INVALID_TOKEN = 'invalid_token';

describe('AuthGuard', () => {
  let repository: Repository<User>;
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const dataSourceTest = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User],
      synchronize: true,
      dropSchema: true,
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    })
      .overrideProvider(DATA_SOURCE)
      .useFactory({
        factory: async () => {
          return dataSourceTest.initialize();
        },
      })
      .compile();

    repository = dataSourceTest.getRepository(User);
    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const createMockContext = (token?: string) => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: token ? `Bearer ${token}` : undefined,
            },
          }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;
    };

    it('should return true for public routes', async () => {
      const context = createMockContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should throw UnauthorizedException when no token is present', async () => {
      const context = createMockContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const context = createMockContext(INVALID_TOKEN);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true for valid token', async () => {
      await repository.insert(USER_RECORD);

      const mockPayload = { sub: USER_RECORD.id, email: USER_RECORD.email };
      const context = createMockContext(VALID_TOKEN);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it('should return undefined for malformed authorization header', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'InvalidFormat Token',
            },
          }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
