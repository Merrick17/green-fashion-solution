import { Controller, Get, Put, Body, Param, Request } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ProposalAiSessionsService } from './proposal-ai-sessions.service';
import { UpsertProposalAiSessionDto } from './dto/upsert-proposal-ai-session.dto';

@Controller('projects/:projectId/proposal-ai-session')
export class ProposalAiSessionsController {
  constructor(private readonly proposalAiSessionsService: ProposalAiSessionsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findOne(
    @Param('projectId') projectId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.proposalAiSessionsService.findByProject(
      projectId,
      req.user.id,
      req.user.role,
    );
  }

  @Put()
  @Roles(UserRole.ADMIN)
  upsert(
    @Param('projectId') projectId: string,
    @Body() dto: UpsertProposalAiSessionDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.proposalAiSessionsService.upsert(
      projectId,
      dto,
      req.user.id,
      req.user.role,
    );
  }
}
