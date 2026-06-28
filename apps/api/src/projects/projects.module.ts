import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsAgentContextService } from './projects-agent-context.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { BriefOptionsModule } from '../brief-options/brief-options.module';

@Module({
  imports: [PrismaModule, EventsModule, BriefOptionsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsAgentContextService],
  exports: [ProjectsService, ProjectsAgentContextService],
})
export class ProjectsModule {}
