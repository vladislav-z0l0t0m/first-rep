import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          
      forbidNonWhitelisted: true, 
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nest learn API')
    .setDescription('API doc for Instagram')
    .build();

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('/swager', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
