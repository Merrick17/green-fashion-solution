import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, ForbiddenException,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  create(
    @Body() dto: CreateMilestoneDto,
    @Request() req: { user: { role: string } },
  ) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.milestonesService.create(dto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string, @Query() query: PaginationQueryDto) {
    return this.milestonesService.findByProject(projectId, query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
    @Request() req: { user: { role: string } },
  ) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.milestonesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.milestonesService.remove(id);
  }
}
