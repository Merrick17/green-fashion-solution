import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Request,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsAgentContextService } from './projects-agent-context.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, REVISION_MODE_PARAM } from '@repo/types';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly agentContextService: ProjectsAgentContextService,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.CUSTOMER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only customers can create projects');
    }
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) return this.projectsService.findAll(query);
    return this.projectsService.findByCustomer(req.user.id, query);
  }

  @Get(':id/agent-context')
  @Roles(UserRole.ADMIN)
  getAgentContext(
    @Param('id') id: string,
    @Query(REVISION_MODE_PARAM) revisionMode?: string,
  ) {
    return this.agentContextService.getAgentContext(id, {
      revisionMode: revisionMode === 'true',
      filterByTaskDesigners: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    const project = await this.projectsService.findById(id);
    if (req.user.role !== UserRole.ADMIN && project.customerId !== req.user.id) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  @Patch(':id/submit')
  async submit(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can submit project briefs');
    }
    const project = await this.projectsService.findById(id);
    if (project.customerId !== req.user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.projectsService.submit(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    const project = await this.projectsService.findById(id);
    if (req.user.role !== UserRole.ADMIN && project.customerId !== req.user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.projectsService.remove(id);
  }
}