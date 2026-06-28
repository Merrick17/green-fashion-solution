import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DesignerApplicationsModule } from '../designer-applications/designer-applications.module';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { TasksModule } from '../tasks/tasks.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { LeadsModule } from '../leads/leads.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { MoodboardsModule } from '../moodboards/moodboards.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { AssetsModule } from '../assets/assets.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    DesignerApplicationsModule,
    RedisModule,
    PrismaModule,
    UsersModule,
    ProjectsModule,
    ProposalsModule,
    TasksModule,
    MeetingsModule,
    LeadsModule,
    WaitlistModule,
    MoodboardsModule,
    FilesModule,
    NotificationsModule,
    AuditModule,
    AssetsModule,
    AnalyticsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
