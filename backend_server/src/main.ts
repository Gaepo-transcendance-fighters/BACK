import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config({ path: '/.env' });
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow requests from port 3000
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*',
    credentials: true,
  });
  await app.listen(4000);
}
bootstrap();
