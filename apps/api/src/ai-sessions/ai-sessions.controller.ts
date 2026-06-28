import { Controller, Get, Put, Body, Param, Request } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AiSessionsService } from './ai-sessions.service';
import { UpsertAiSessionDto } from './dto/upsert-ai-session.dto';

@Controller('moodboards/:moodboardId/ai-session')
export class AiSessionsController {
  constructor(private readonly aiSessionsService: AiSessionsService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  findOne(
    @Param('moodboardId') moodboardId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.aiSessionsService.findByMoodboard(moodboardId, req.user.id, req.user.role);
  }

  @Put()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  upsert(
    @Param('moodboardId') moodboardId: string,
    @Body() dto: UpsertAiSessionDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.aiSessionsService.upsert(moodboardId, dto, req.user.id, req.user.role);
  }
}
