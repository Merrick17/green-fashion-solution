import { Module } from '@nestjs/common';
import { MoodItemsController } from './mood-items.controller';
import { MoodItemsService } from './mood-items.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [MoodItemsController],
  providers: [MoodItemsService],
  exports: [MoodItemsService],
})
export class MoodItemsModule {}