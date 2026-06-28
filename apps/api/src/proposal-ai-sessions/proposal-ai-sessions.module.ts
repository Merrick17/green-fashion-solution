import { Module } from '@nestjs/common';
import { ProposalAiSessionsController } from './proposal-ai-sessions.controller';
import { ProposalAiSessionsService } from './proposal-ai-sessions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProposalAiSessionsController],
  providers: [ProposalAiSessionsService],
  exports: [ProposalAiSessionsService],
})
export class ProposalAiSessionsModule {}
