import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const origins = config.getOrThrow<string[]>('CORS_ORIGIN_LIST');
  const port = config.getOrThrow<number>('PORT');

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
