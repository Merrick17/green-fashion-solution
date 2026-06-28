import { Module } from '@nestjs/common';
import { MoodboardsController } from './moodboards.controller';
import { MoodboardsService } from './moodboards.service';

@Module({
  controllers: [MoodboardsController],
  providers: [MoodboardsService],
  exports: [MoodboardsService],
})
export class MoodboardsModule {}
