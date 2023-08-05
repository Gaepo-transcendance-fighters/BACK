import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from port 3000
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*',
    credentials: true,
  });
  await app.listen(4000);
}
bootstrap();
