import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import * as Joi from 'joi';
import { AppLoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';

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

const typeOrmConfigFactory = async (configService: ConfigService<Config>) => {
  const isProd = configService.get<NODE_ENV>('NODE_ENV') === NODE_ENV.PROD;

  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get('PG_HOST'),
    port: configService.get<number>('PG_PORT'),
    username: configService.get('PG_USERNAME'),
    password: configService.get('PG_PASSWORD'),
    database: configService.get('PG_DATABASE'),
    entities: [User],
    synchronize: !isProd ? true : false,
  };

  return config;
};

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
      useFactory: typeOrmConfigFactory,
    }),
    AuthModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
