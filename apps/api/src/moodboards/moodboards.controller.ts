import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { MoodboardsService } from './moodboards.service';
import { CreateMoodboardDto } from './dto/create-moodboard.dto';
import { UpdateMoodboardDto } from './dto/update-moodboard.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';

@Controller('moodboards')
export class MoodboardsController {
  constructor(private readonly moodboardsService: MoodboardsService) {}

  @Post()
  create(@Body() dto: CreateMoodboardDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.CUSTOMER) throw new ForbiddenException('Customers only');
    return this.moodboardsService.create(dto, req.user.id);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodboardsService.findByProject(projectId, req.user.id, req.user.role, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.moodboardsService.findById(id, req.user.id, req.user.role);
  }

  @Get(':id/full')
  findFull(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.moodboardsService.findFull(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMoodboardDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodboardsService.update(id, dto, req.user.id, req.user.role);
  }

  @Post(':id/reset')
  reset(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.moodboardsService.reset(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.moodboardsService.remove(id, req.user.id, req.user.role);
  }
}