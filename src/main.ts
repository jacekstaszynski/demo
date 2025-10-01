import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CatchUnknownExceptions } from './error-handling/catch-unknown-exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchUnknownExceptions(httpAdapterHost));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
