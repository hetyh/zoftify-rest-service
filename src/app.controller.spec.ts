import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { User } from './users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';

describe('AppController', () => {
  let appController: AppController;
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
        TerminusModule,
      ],
      providers: [AppController],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status for health', async () => {
      const res = {
        details: {
          typeorm: {
            status: 'up',
          },
        },
        error: {},
        info: {
          typeorm: {
            status: 'up',
          },
        },
        status: 'ok',
      };

      expect(await appController.checkHealth()).toStrictEqual(res);
    });
  });
});
