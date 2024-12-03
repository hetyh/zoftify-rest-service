import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppLoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';

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

enum NODE_ENV {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
}

export interface Config {
  NODE_ENV: NODE_ENV;
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
    DatabaseModule,
    UsersModule,
    AuthModule,
    TerminusModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
