import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { MoodItemsService } from './mood-items.service';
import { CreateMoodItemDto } from './dto/create-mood-item.dto';
import { UpdateMoodItemDto } from './dto/update-mood-item.dto';
import { BatchUpdateMoodItemsDto } from './dto/batch-update-mood-items.dto';
import { ReorderMoodItemsDto } from './dto/reorder-mood-items.dto';

@Controller('moodboards/:moodboardId/items')
export class MoodItemsController {
  constructor(private readonly moodItemsService: MoodItemsService) {}

  @Post()
  create(
    @Param('moodboardId') moodboardId: string,
    @Body() dto: CreateMoodItemDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.create(moodboardId, dto, req.user.id, req.user.role);
  }

  @Get()
  findByMoodboard(
    @Param('moodboardId') moodboardId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.findByMoodboard(moodboardId, req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(
    @Param('moodboardId') moodboardId: string,
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('moodboardId') moodboardId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMoodItemDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(
    @Param('moodboardId') moodboardId: string,
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.remove(id, req.user.id, req.user.role);
  }

  @Patch()
  batchUpdate(
    @Param('moodboardId') moodboardId: string,
    @Body() dto: BatchUpdateMoodItemsDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.batchUpdate(dto, req.user.id, req.user.role);
  }

  @Post('reorder')
  reorder(
    @Param('moodboardId') moodboardId: string,
    @Body() dto: ReorderMoodItemsDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.moodItemsService.reorder(dto.itemIds, req.user.id, req.user.role);
  }
}