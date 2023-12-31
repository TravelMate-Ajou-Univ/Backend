import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import basicAuth from 'express-basic-auth';
import { UnhandledExceptionFilter } from './common/filiters/unhandled-exception.filter';
import { HttpExceptionFilter } from './common/filiters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ValidationHttpError } from './common/errors/validation-http-error';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  //TODO: cors 수정
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const user = app.get<ConfigService>(ConfigService).get('SWAGGER_USER');
  const pw = app.get<ConfigService>(ConfigService).get('SWAGGER_PASSWORD');
  app.use(
    ['/api/docs'],
    basicAuth({
      challenge: true,
      users: {
        [user]: pw,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new ValidationHttpError(errors);
      },
    }),
  );

  app.useGlobalFilters(
    new UnhandledExceptionFilter(),
    new HttpExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('TravelMate Swagger')
    .setDescription('캡스톤 디자인 TravelMate BE API 스웨거입니다')
    .setVersion('1.0.0')
    .addTag('swagger')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = app.get<ConfigService>(ConfigService).get('SERVER_PORT');

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
