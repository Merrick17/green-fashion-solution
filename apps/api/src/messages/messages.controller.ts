import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageThreadDto, SendMessageDto } from './dto/message.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';
import { Roles } from '../common/decorators';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  findThreads(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.messagesService.findThreads(req.user.id, req.user.role, query);
  }

  @Get('threads/:id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  findThread(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.messagesService.findThread(id, req.user.id, req.user.role);
  }

  @Post('threads')
  @Roles(UserRole.CUSTOMER)
  createThread(
    @Body() dto: CreateMessageThreadDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.messagesService.createThread(dto, req.user.id, req.user.role);
  }

  @Get('brief-qa/:projectId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async getBriefQaThread(
    @Param('projectId') projectId: string,
  ) {
    const customerId = await this.messagesService.getProjectCustomerId(projectId);
    return this.messagesService.findOrCreateBriefQaThread(projectId, customerId);
  }

  @Post('threads/:id/messages')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.DESIGNER) {
      throw new ForbiddenException('Designers cannot access messages');
    }
    return this.messagesService.sendMessage(id, dto, req.user.id, req.user.role);
  }
}
