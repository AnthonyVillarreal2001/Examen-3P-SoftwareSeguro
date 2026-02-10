/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Cuentas - Cooperativa')
    .setDescription('Microservicio para gestión de cuentas de ahorro')
    .setVersion('1.0')
    .addTag('cuentas')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Habilitar CORS
  app.enableCors();
  
  await app.listen(3000);
  console.log('Microservicio de Cuentas ejecutándose en http://localhost:3000');
  console.log('Swagger disponible en http://localhost:3000/api-docs');
}
bootstrap();