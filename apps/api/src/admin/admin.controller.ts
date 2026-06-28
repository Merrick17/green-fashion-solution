import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';
import { IsEnum } from 'class-validator';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin-user.dto';
import { ApproveDesignerApplicationDto } from '../designer-applications/dto/designer-application.dto';

class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

class UpdateLeadDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;
}

@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Users
  @Post('users')
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Designer applications
  @Get('designer-applications')
  findAllDesignerApplications(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllDesignerApplications(query);
  }

  @Post('designer-applications/:id/approve')
  approveDesignerApplication(
    @Param('id') id: string,
    @Body() dto: ApproveDesignerApplicationDto,
  ) {
    return this.adminService.approveDesignerApplication(id, dto);
  }

  @Patch('designer-applications/:id/reject')
  rejectDesignerApplication(@Param('id') id: string) {
    return this.adminService.rejectDesignerApplication(id);
  }

  @Delete('designer-applications/:id')
  deleteDesignerApplication(@Param('id') id: string) {
    return this.adminService.deleteDesignerApplication(id);
  }

  // Lists
  @Get('leads')
  findAllLeads(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllLeads(query);
  }

  @Get('waitlist')
  findAllWaitlist(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllWaitlist(query);
  }

  @Get('moodboards')
  findAllMoodboards(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllMoodboards(query);
  }

  @Get('files')
  findAllFiles(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllFiles(query);
  }

  @Get('inspiration')
  findAllInspiration(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllInspiration(query);
  }

  @Get('notifications')
  findAllNotifications(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllNotifications(query);
  }

  @Get('audit-logs')
  findAllAuditLogs(@Query() query: PaginationQueryDto) {
    return this.adminService.findAllAuditLogs(query);
  }

  // Deletes
  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.adminService.updateLead(id, dto);
  }

  @Delete('leads/:id')
  deleteLead(@Param('id') id: string) {
    return this.adminService.deleteLead(id);
  }

  @Delete('waitlist/:id')
  deleteWaitlistEntry(@Param('id') id: string) {
    return this.adminService.deleteWaitlistEntry(id);
  }

  @Delete('moodboards/:id')
  deleteMoodboard(@Param('id') id: string) {
    return this.adminService.deleteMoodboard(id);
  }

  @Delete('files/:id')
  deleteFile(@Param('id') id: string) {
    return this.adminService.deleteFile(id);
  }

  @Delete('notifications/:id')
  deleteNotification(@Param('id') id: string) {
    return this.adminService.deleteNotification(id);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  @Delete('proposals/:id')
  deleteProposal(@Param('id') id: string) {
    return this.adminService.deleteProposal(id);
  }

  @Delete('meetings/:id')
  deleteMeeting(@Param('id') id: string) {
    return this.adminService.deleteMeeting(id);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) {
    return this.adminService.deleteTask(id);
  }

  @Delete('assets/fabrics/:id')
  deleteFabricAsset(@Param('id') id: string) {
    return this.adminService.deleteFabricAsset(id);
  }

  @Delete('assets/products/:id')
  deleteProductAsset(@Param('id') id: string) {
    return this.adminService.deleteProductAsset(id);
  }

  @Delete('inspiration/:id')
  deleteInspiration(@Param('id') id: string) {
    return this.adminService.deleteInspiration(id);
  }

  @Delete('milestones/:id')
  deleteMilestone(@Param('id') id: string) {
    return this.adminService.deleteMilestone(id);
  }
}
