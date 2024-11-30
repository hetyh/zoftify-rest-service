import { NestFactory } from '@nestjs/core';
import { AppModule, Config } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Example service')
    .setDescription('The service API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, documentFactory);

  const configService = app.get(ConfigService<Config>);

  await app.listen(configService.get('APP_PORT') as number);
}
bootstrap();
