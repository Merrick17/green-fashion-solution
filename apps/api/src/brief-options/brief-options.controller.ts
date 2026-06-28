import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { BriefOptionsService } from './brief-options.service';
import {
  CreateBriefOptionDto,
  UpdateBriefOptionDto,
  ListBriefOptionsQueryDto,
} from './dto/brief-option.dto';
import { Roles } from '../common/decorators';
import { UserRole } from '@repo/types';

@Controller('brief-options')
export class BriefOptionsController {
  constructor(private readonly briefOptionsService: BriefOptionsService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  findAll(
    @Query() query: ListBriefOptionsQueryDto,
    @Request() req: { user: { role: string } },
  ) {
    const includeInactive =
      req.user.role === UserRole.ADMIN && query.includeInactive === true;
    return this.briefOptionsService.findAll(query.type, includeInactive);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateBriefOptionDto) {
    return this.briefOptionsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBriefOptionDto) {
    return this.briefOptionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.briefOptionsService.remove(id);
  }
}
