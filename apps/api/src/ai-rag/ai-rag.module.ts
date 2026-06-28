import { Module } from '@nestjs/common';
import { AiRagController } from './ai-rag.controller';
import { AiRagService } from './ai-rag.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiRagController],
  providers: [AiRagService],
  exports: [AiRagService],
})
export class AiRagModule {}
