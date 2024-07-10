
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper-data/wrapper-data.interceptor';
import { Reflector } from '@nestjs/core';

export function applyGlobalConfig(app: INestApplication) {
app.useGlobalPipes(
  new ValidationPipe({
    errorHttpStatusCode: 422,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  })
)
  app.useGlobalInterceptors(new WrapperDataInterceptor( ),new ClassSerializerInterceptor(app.get(Reflector)))

}
