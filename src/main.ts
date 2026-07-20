import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Reflector } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ResponseWrapperInterceptor } from './common/interceptors/response-wrapper.interceptor.js';

type ValidationResponseItem = {
  property: string;
  message: string;
};

const toValidationResponseItems = (
  errors: Array<{
    property?: string;
    constraints?: Record<string, string>;
    children?: unknown[];
  }>,
  parentPath = '',
): ValidationResponseItem[] =>
  errors.flatMap((error) => {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property ?? ''}`.replace(/\.$/, '')
      : (error.property ?? 'unknown');

    const currentErrorItems = error.constraints
      ? Object.values(error.constraints).map((message) => ({
          property: propertyPath,
          message,
        }))
      : [];

    const childErrors = Array.isArray(error.children)
      ? toValidationResponseItems(
          error.children as Array<{
            property?: string;
            constraints?: Record<string, string>;
            children?: unknown[];
          }>,
          propertyPath,
        )
      : [];

    return [...currentErrorItems, ...childErrors];
  });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(toValidationResponseItems(errors)),
    }),
  );
  app.useGlobalInterceptors(new ResponseWrapperInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
