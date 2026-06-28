import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, Res,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateProposalItemDto } from './dto/update-proposal-item.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(@Body() dto: CreateProposalDto, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Only admin can create proposals');
    return this.proposalsService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.proposalsService.findAll(req.user.id, req.user.role, query);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Res() res: Response,
  ) {
    const buffer = await this.proposalsService.generatePdf(id, req.user.id, req.user.role);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="proposal-${id.slice(0, 8)}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/pptx')
  async downloadPptx(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Res() res: Response,
  ) {
    const buffer = await this.proposalsService.generatePptx(id, req.user.id, req.user.role);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="proposal-${id.slice(0, 8)}.pptx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.proposalsService.findById(id, req.user.id, req.user.role);
  }

  @Post(':id/view')
  async recordView(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.CUSTOMER) throw new ForbiddenException('Customers only');
    await this.proposalsService.recordView(id, req.user.id);
    return { ok: true };
  }

  @Post(':id/change-requests')
  createChangeRequest(
    @Param('id') id: string,
    @Body() dto: CreateChangeRequestDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.CUSTOMER) throw new ForbiddenException('Customers only');
    return this.proposalsService.createChangeRequest(id, dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProposalDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) return this.proposalsService.update(id, dto);
    if (req.user.role === UserRole.CUSTOMER) return this.proposalsService.customerUpdate(id, dto, req.user.id);
    throw new ForbiddenException('Access denied');
  }

  @Patch(':proposalId/items/:itemId')
  updateItem(
    @Param('proposalId') proposalId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateProposalItemDto,
    @Request() req: { user: { role: string } },
  ) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.proposalsService.updateProposalItem(proposalId, itemId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Only admin can delete proposals');
    return this.proposalsService.remove(id);
  }
}
