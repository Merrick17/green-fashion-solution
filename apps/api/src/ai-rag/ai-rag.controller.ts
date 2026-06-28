import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@repo/types';
import { AiRagService } from './ai-rag.service';
import { RagSearchDto, UpsertRagChunksDto } from './dto/rag.dto';

@Controller('projects/:projectId/rag')
export class AiRagController {
  constructor(private readonly aiRagService: AiRagService) {}

  @Get('hashes')
  @Roles(UserRole.ADMIN)
  hashes(@Param('projectId') projectId: string) {
    return this.aiRagService.getContentHashes(projectId);
  }

  @Post('index')
  @Roles(UserRole.ADMIN)
  upsert(@Param('projectId') projectId: string, @Body() dto: UpsertRagChunksDto) {
    return this.aiRagService.upsertChunks(projectId, dto.chunks);
  }

  @Post('search')
  @Roles(UserRole.ADMIN)
  search(@Param('projectId') projectId: string, @Body() dto: RagSearchDto) {
    return this.aiRagService.search(projectId, dto.queryEmbedding, dto.topK ?? 8);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Param('projectId') projectId: string) {
    return this.aiRagService.listByProject(projectId);
  }
}
