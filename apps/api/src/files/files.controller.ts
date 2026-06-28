import {
  Controller, Get, Post, Delete, Body, Param, Query, Request, ForbiddenException, BadRequestException, Put, Req, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';
import { IsString } from 'class-validator';
import { Public } from '../common/decorators/public.decorator';
import { StorageService } from './storage.service';

class CreateFileDto {
  @IsString()
  projectId!: string;

  @IsString()
  url!: string;

  @IsString()
  type!: string;
}

class RequestUploadDto {
  @IsString()
  projectId!: string;

  @IsString()
  filename!: string;

  @IsString()
  type!: string;

  @IsString()
  contentType!: string;
}

class MoodboardUploadDto {
  @IsString()
  moodboardId!: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;
}

class AssetUploadDto {
  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;
}

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storage: StorageService,
  ) {}

  @Get('resolve')
  async resolveKey(@Query('key') key: string) {
    return { url: await this.storage.getSignedGetUrl(key) };
  }

  @Post('upload-url')
  requestUpload(
    @Body() dto: RequestUploadDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.filesService.requestUpload(
      dto.projectId,
      req.user.id,
      dto.filename,
      dto.type,
      dto.contentType,
    );
  }

  @Post('upload-url/moodboard')
  requestMoodboardUpload(
    @Body() dto: MoodboardUploadDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.requestMoodboardUpload(
      dto.moodboardId,
      req.user.id,
      dto.filename,
      dto.contentType,
    );
  }

  @Post('upload-url/asset')
  requestAssetUpload(
    @Body() dto: AssetUploadDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Designers only');
    }
    return this.filesService.requestAssetUpload(req.user.id, dto.filename, dto.contentType);
  }

  @Public()
  @Put('dev-upload')
  async devUpload(
    @Query('key') key: string,
    @Req() req: { body: Buffer },
    @Res() res: Response,
  ) {
    if (this.storage.isConfigured()) {
      return res.status(400).json({ message: 'Cloudinary is configured' });
    }
    if (!key) return res.status(400).json({ message: 'key required' });
    const result = await this.filesService.devUpload(key, req.body as Buffer);
    return res.json(result);
  }

  @Post('upload-buffer/moodboard')
  async uploadMoodboardBuffer(
    @Query('moodboardId') moodboardId: string,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Req() req: { body: Buffer; user: { id: string } },
  ) {
    if (!moodboardId) throw new BadRequestException('moodboardId required');
    return this.filesService.uploadMoodboardBuffer(
      moodboardId,
      req.user.id,
      req.body as Buffer,
      contentType || 'image/png',
      filename || 'upload.png',
    );
  }

  @Post('upload-buffer/asset')
  async uploadAssetBuffer(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
    @Req() req: { body: Buffer; user: { id: string; role: string } },
  ) {
    return this.filesService.uploadAssetBuffer(
      req.user.id,
      req.user.role,
      req.body as Buffer,
      contentType || 'image/png',
      filename || 'upload.png',
    );
  }

  @Post()
  create(@Body() dto: CreateFileDto, @Request() req: { user: { id: string; role: string } }) {
    return this.filesService.create(dto.projectId, req.user.id, dto.url, dto.type);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.filesService.findByProject(projectId, req.user.id, req.user.role, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.filesService.findByIdWithAccess(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Admin only');
    return this.filesService.remove(id);
  }
}
