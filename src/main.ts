import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nest learn API')
    .setDescription('API doc for Instagram')
    .build();

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('/swager', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
