import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, GraphModule, EventsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
