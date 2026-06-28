import { Controller, Get, Patch, Param, Query, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.notificationsService.findByUser(req.user.id, query);
  }

  @Patch('read-all')
  async markAllRead(@Request() req: { user: { id: string } }) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.notificationsService.markRead(id, req.user.id);
  }
}
