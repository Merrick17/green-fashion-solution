import {
  Controller, Get, Post, Patch, Body, Param, Query, Request,
  ForbiddenException,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  async create(@Body() dto: CreateMeetingDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.CUSTOMER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only customers can request meetings');
    }
    return this.meetingsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) return this.meetingsService.findAll(query);
    return this.meetingsService.findByCustomer(req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.meetingsService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @Request() req: { user: { role: string } },
  ) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Only admin can update meetings');
    return this.meetingsService.update(id, dto);
  }
}
