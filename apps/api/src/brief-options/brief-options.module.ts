import { Module } from '@nestjs/common';
import { BriefOptionsController } from './brief-options.controller';
import { BriefOptionsService } from './brief-options.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BriefOptionsController],
  providers: [BriefOptionsService],
  exports: [BriefOptionsService],
})
export class BriefOptionsModule {}
