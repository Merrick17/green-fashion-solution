import { Controller, Get, Post, Body, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { InspirationService } from './inspiration.service';
import { CreateInspirationSelectionDto } from './dto/create-inspiration.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';

@Controller('inspiration')
export class InspirationController {
  constructor(private readonly inspirationService: InspirationService) {}

  @Get('project/:projectId')
  getCurated(
    @Param('projectId') projectId: string,
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.CUSTOMER) throw new ForbiddenException('Customers only');
    return this.inspirationService.getCuratedAssets(projectId, req.user.id, query);
  }

  @Post('select')
  toggle(
    @Body() dto: CreateInspirationSelectionDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.CUSTOMER) throw new ForbiddenException('Customers only');
    return this.inspirationService.toggleSelection(dto, req.user.id);
  }
}
