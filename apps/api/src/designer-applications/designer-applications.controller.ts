import { Controller, Post, Body } from '@nestjs/common';
import { DesignerApplicationsService } from './designer-applications.service';
import { CreateDesignerApplicationDto } from './dto/designer-application.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('designer-applications')
export class DesignerApplicationsController {
  constructor(private readonly service: DesignerApplicationsService) {}

  @Public()
  @Post()
  submit(@Body() dto: CreateDesignerApplicationDto) {
    return this.service.submit(dto);
  }
}
