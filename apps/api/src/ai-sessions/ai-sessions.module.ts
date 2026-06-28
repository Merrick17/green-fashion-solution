import { Module } from '@nestjs/common';
import { AiSessionsController } from './ai-sessions.controller';
import { AiSessionsService } from './ai-sessions.service';

@Module({
  controllers: [AiSessionsController],
  providers: [AiSessionsService],
  exports: [AiSessionsService],
})
export class AiSessionsModule {}
