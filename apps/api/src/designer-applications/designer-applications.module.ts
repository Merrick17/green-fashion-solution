import { Module } from '@nestjs/common';
import { DesignerApplicationsService } from './designer-applications.service';
import { DesignerApplicationsController } from './designer-applications.controller';

@Module({
  controllers: [DesignerApplicationsController],
  providers: [DesignerApplicationsService],
  exports: [DesignerApplicationsService],
})
export class DesignerApplicationsModule {}
