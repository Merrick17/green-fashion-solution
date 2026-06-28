import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Request,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, TaskListQueryDto } from './dto/update-task.dto';
import { UserRole } from '@repo/types';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() dto: CreateTaskDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Only admin can assign briefs');
    return this.tasksService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: TaskListQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) return this.tasksService.findAll(query);
    if (req.user.role === UserRole.DESIGNER) {
      return this.tasksService.findByDesigner(req.user.id, query);
    }
    throw new ForbiddenException('Access denied');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.tasksService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) return this.tasksService.update(id, dto);
    if (req.user.role === UserRole.DESIGNER) return this.tasksService.designerUpdate(id, dto, req.user.id);
    throw new ForbiddenException('Access denied');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.tasksService.remove(id);
  }
}
