import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GraphService } from './graph/graph.service';
import { StorageService } from './files/storage.service';
import { BRAND } from './config/brand';
import { DEFAULT_WEB_URL } from './config/defaults';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.CORS_ORIGINS ?? DEFAULT_WEB_URL)
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use('/api/files/dev-upload', express.raw({ type: () => true, limit: '25mb' }));
  app.use('/api/files/upload-buffer/moodboard', express.raw({ type: () => true, limit: '25mb' }));
  app.use('/api/files/upload-buffer/asset', express.raw({ type: () => true, limit: '25mb' }));
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(`${BRAND.NAME} API`)
    .setDescription('Fashion Sourcing Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const graph = app.get(GraphService);
  if (!graph.isConfigured()) {
    logger.warn('Microsoft Graph not configured — Teams links will be skipped');
  }

  const storage = app.get(StorageService);
  if (storage.provider() === 'local') {
    logger.warn(
      'Cloudinary not configured — files stored locally under apps/api/uploads (set CLOUDINARY_* in apps/api/.env for production)',
    );
  } else {
    logger.log('File storage: Cloudinary');
  }

  await app.listen(3000);
}
void bootstrap();
