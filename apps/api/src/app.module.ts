import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AssetsModule } from './assets/assets.module';
import { ProposalsModule } from './proposals/proposals.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FilesModule } from './files/files.module';
import { CalendarModule } from './calendar/calendar.module';
import { LeadsModule } from './leads/leads.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { DesignerApplicationsModule } from './designer-applications/designer-applications.module';
import { TasksModule } from './tasks/tasks.module';
import { MoodboardsModule } from './moodboards/moodboards.module';
import { MoodItemsModule } from './mood-items/mood-items.module';
import { MoodboardSnapshotsModule } from './moodboard-snapshots/moodboard-snapshots.module';
import { InspirationModule } from './inspiration/inspiration.module';
import { MilestonesModule } from './milestones/milestones.module';
import { GraphModule } from './graph/graph.module';
import { EventsModule } from './events/events.module';
import { AuditModule } from './audit/audit.module';
import { AdminModule } from './admin/admin.module';
import { AiSessionsModule } from './ai-sessions/ai-sessions.module';
import { ProposalAiSessionsModule } from './proposal-ai-sessions/proposal-ai-sessions.module';
import { AiRagModule } from './ai-rag/ai-rag.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { CollectionsModule } from './collections/collections.module';
import { MessagesModule } from './messages/messages.module';
import { BriefOptionsModule } from './brief-options/brief-options.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { RequestLogMiddleware } from './common/middleware/request-log.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppCacheModule } from './cache/cache.module';
import { LoggingModule } from './common/logging/logging.module';
import { InstrumentationInterceptor } from './common/logging/instrumentation.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
    RedisModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    AssetsModule,
    ProposalsModule,
    MeetingsModule,
    NotificationsModule,
    FilesModule,
    CalendarModule,
    LeadsModule,
    WaitlistModule,
    DesignerApplicationsModule,
    TasksModule,
    MoodboardsModule,
    MoodItemsModule,
    MoodboardSnapshotsModule,
    AiSessionsModule,
    ProposalAiSessionsModule,
    AiRagModule,
    EmailModule,
    HealthModule,
    InspirationModule,
    MilestonesModule,
    GraphModule,
    EventsModule,
    AuditModule,
    AdminModule,
    CollectionsModule,
    MessagesModule,
    BriefOptionsModule,
    AppCacheModule,
    LoggingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: InstrumentationInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // RequestIdMiddleware first so the correlation id is available to logging and the exception filter.
    consumer.apply(RequestIdMiddleware, RequestLogMiddleware).forRoutes('*');
  }
}
