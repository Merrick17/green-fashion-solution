import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { ProposalPdfService } from './proposal-pdf.service';
import { ProposalPptxService } from './proposal-pptx.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [PrismaModule, EventsModule, FilesModule],
  controllers: [ProposalsController],
  providers: [ProposalsService, ProposalPdfService, ProposalPptxService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
