import { Controller, Post, Body } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  create(@Body() dto: CreateWaitlistDto) {
    return this.waitlistService.create(dto);
  }
}
