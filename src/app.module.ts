import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import * as Joi from 'joi';
import { PGliteDriver } from 'typeorm-pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { AppLoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';

export const configValidation = Joi.object<Config>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  APP_PORT: Joi.number().port().required(),
  APP_SECRET: Joi.string().required(),
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().port().required(),
  PG_USERNAME: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DATABASE: Joi.string().required(),
});

export interface Config {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_PORT: number;
  APP_SECRET: string;
  PG_HOST: string;
  PG_PORT: number;
  PG_USERNAME: string;
  PG_PASSWORD: string;
  PG_DATABASE: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
    }),
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => ({
        type: 'postgres',
        driver: new PGliteDriver({
          dataDir: 'pg_data',
          extensions: { uuid_ossp },
        }).driver,
        host: configService.get('PG_HOST'),
        port: configService.get<number>('PG_PORT'),
        username: configService.get('PG_USERNAME'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DATABASE'),
        entities: [User],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
