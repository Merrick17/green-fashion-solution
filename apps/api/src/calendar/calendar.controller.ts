import { Controller, Get, Query, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getEvents(
    @Query('start') start: string,
    @Query('end') end: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.calendarService.getEvents(req.user.id, req.user.role, start, end);
  }
}