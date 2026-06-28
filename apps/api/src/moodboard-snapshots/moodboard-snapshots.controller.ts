import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { MoodboardSnapshotsService } from './moodboard-snapshots.service';
import { CreateMoodboardSnapshotDto } from './dto/create-moodboard-snapshot.dto';

@Controller('moodboards/:moodboardId/snapshots')
export class MoodboardSnapshotsController {
  constructor(private readonly snapshotsService: MoodboardSnapshotsService) {}

  @Post()
  create(
    @Param('moodboardId') moodboardId: string,
    @Body() dto: CreateMoodboardSnapshotDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.snapshotsService.create(moodboardId, dto, req.user.id, req.user.role);
  }

  @Get()
  findByMoodboard(
    @Param('moodboardId') moodboardId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.snapshotsService.findByMoodboard(moodboardId, req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(
    @Param('moodboardId') moodboardId: string,
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.snapshotsService.findById(moodboardId, id, req.user.id, req.user.role);
  }
}