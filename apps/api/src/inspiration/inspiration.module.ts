import { Module } from '@nestjs/common';
import { InspirationController } from './inspiration.controller';
import { InspirationService } from './inspiration.service';

@Module({
  controllers: [InspirationController],
  providers: [InspirationService],
})
export class InspirationModule {}
