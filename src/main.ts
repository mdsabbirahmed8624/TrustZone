import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Register Helmet middleware for HTTP header security
  app.use(helmet());

  // Set Global API Route Prefixing
  app.setGlobalPrefix('api/v1', {
    exclude: [
      '/',
      'health',
      'api/v1/health',
      'api/v2/(.*)',
      'api/v13/(.*)',
      'api/v14/(.*)',
    ],
  });

  // Configure Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('TrustZone Mobile Care API')
    .setDescription('The API documentation for TrustZone Mobile Care backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Configure CORS Policy
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  app.enableCors({
    origin: allowedOrigins
      ? allowedOrigins.split(',').map((o) => o.trim())
      : true, // Configured for flexible local testing; override with ALLOWED_ORIGINS in prod
    credentials: true,
  });

  // Register Global Pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register Global Custom Interceptors and Filters
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Bind and Listen to Port
  const port = configService.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');

  logger.log(`Server successfully started, listening on port: ${port}`);
  logger.log(`API URL mapping: http://localhost:${port}/api/v1`);
  logger.log(
    `Swagger documentation UI available at: http://localhost:${port}/docs`,
  );
}

bootstrap();
