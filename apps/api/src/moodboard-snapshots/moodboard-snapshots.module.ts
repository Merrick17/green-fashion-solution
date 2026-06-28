import { Module } from '@nestjs/common';
import { MoodboardSnapshotsController } from './moodboard-snapshots.controller';
import { MoodboardSnapshotsService } from './moodboard-snapshots.service';

@Module({
  controllers: [MoodboardSnapshotsController],
  providers: [MoodboardSnapshotsService],
  exports: [MoodboardSnapshotsService],
})
export class MoodboardSnapshotsModule {}