import { Controller, Get, Patch, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';
import { IsBoolean, IsEnum } from 'class-validator';

class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

class UpdateEmailPrefsDto {
  @IsBoolean()
  emailNotifications!: boolean;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: { user: { id: string } }) {
    return this.usersService.findById(req.user.id);
  }

  @Get('me/export')
  exportMe(@Request() req: { user: { id: string } }) {
    return this.usersService.exportData(req.user.id);
  }

  @Delete('me')
  deleteMe(@Request() req: { user: { id: string } }) {
    return this.usersService.deleteAccount(req.user.id);
  }

  @Patch('me/email-notifications')
  updateEmailPrefs(@Request() req: { user: { id: string } }, @Body() dto: UpdateEmailPrefsDto) {
    return this.usersService.updateEmailNotifications(req.user.id, dto.emailNotifications);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
