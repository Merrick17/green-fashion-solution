import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../files/storage.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination, paginated } from '../common/utils/paginate';
import { isDataUrl } from '../common/utils/content-hash';
import { UserRole } from '@repo/types';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  count(): Promise<number> {
    return this.prisma.file.count();
  }

  async requestUpload(projectId: string, uploadedById: string, filename: string, type: string, contentType: string) {
    await this.assertProjectAccess(projectId, uploadedById);
    const key = this.storage.generateUploadKey(projectId, filename);
    const target = this.storage.getUploadTarget(key, contentType);

    const file = await this.prisma.file.create({
      data: { projectId, uploadedById, url: key, type: type as any, version: 1 },
    });

    return { ...target, fileId: file.id };
  }

  async requestMoodboardUpload(
    moodboardId: string,
    userId: string,
    filename: string,
    contentType: string,
  ) {
    await this.assertMoodboardUploadAccess(moodboardId, userId);
    const key = this.storage.generateMoodboardKey(moodboardId, filename);
    return this.storage.getUploadTarget(key, contentType);
  }

  private async assertMoodboardUploadAccess(moodboardId: string, userId: string) {
    const moodboard = await this.prisma.moodboard.findUnique({
      where: { id: moodboardId },
      include: { project: true },
    });
    if (!moodboard) throw new NotFoundException('Moodboard not found');
    if (moodboard.project.customerId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied');
    }
  }

  async requestAssetUpload(designerId: string, filename: string, contentType: string) {
    const key = this.storage.generateAssetKey(designerId, filename);
    return this.storage.getUploadTarget(key, contentType);
  }

  async devUpload(key: string, buffer: Buffer) {
    if (this.storage.isConfigured()) {
      throw new BadRequestException('Dev upload only available without Cloudinary');
    }
    await this.storage.writeDevUpload(key, buffer);
    return { key, url: `/uploads/${key}` };
  }

  async uploadMoodboardBuffer(
    moodboardId: string,
    userId: string,
    buffer: Buffer,
    contentType: string,
    filename: string,
  ) {
    await this.assertMoodboardUploadAccess(moodboardId, userId);
    const key = this.storage.generateMoodboardKey(moodboardId, filename);
    return this.storage.uploadBuffer(key, buffer, contentType);
  }

  async uploadAssetBuffer(
    designerId: string,
    role: string,
    buffer: Buffer,
    contentType: string,
    filename: string,
  ) {
    if (role !== UserRole.DESIGNER && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Designers only');
    }
    const key = this.storage.generateAssetKey(designerId, filename);
    return this.storage.uploadBuffer(key, buffer, contentType);
  }

  async confirmUpload(fileId: string, userId: string) {
    const file = await this.findById(fileId);
    await this.assertProjectAccess(file.projectId, userId);
    return file;
  }

  async create(projectId: string, uploadedById: string, url: string, type: string) {
    await this.assertProjectAccess(projectId, uploadedById);
    this.storage.rejectDataUrl(url, 'url');
    const existing = await this.prisma.file.findFirst({
      where: { projectId, url },
      orderBy: { version: 'desc' },
    });
    const version = existing ? existing.version + 1 : 1;
    return this.prisma.file.create({
      data: { projectId, uploadedById, url, type: type as any, version },
    });
  }

  async findByProject(projectId: string, userId: string, role: string, query: PaginationQueryDto) {
    await this.assertProjectAccessForRole(projectId, userId, role);
    const { page, limit, skip } = resolvePagination(query);
    const where = { projectId };
    const orderBy = { createdAt: query.sortOrder ?? 'desc' };
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.file.count({ where }),
    ]);
    const data = await Promise.all(
      files.map(async (f) => ({
        ...f,
        signedUrl: await this.storage.getSignedGetUrl(f.url),
      })),
    );
    return paginated(data, total, page, limit);
  }

  async findById(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async findByIdWithAccess(id: string, userId: string, role: string) {
    const file = await this.findById(id);
    await this.assertProjectAccessForRole(file.projectId, userId, role);
    return {
      ...file,
      signedUrl: await this.storage.getSignedGetUrl(file.url),
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.file.delete({ where: { id } });
  }

  private async assertProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Access denied');
    if (user.role === UserRole.ADMIN || project.customerId === userId) return;
    if (user.role === UserRole.DESIGNER) return;
    throw new ForbiddenException('Access denied');
  }

  async assertProjectAccessForRole(projectId: string, userId: string, role: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (role === UserRole.ADMIN) return;
    if (role === UserRole.CUSTOMER && project.customerId === userId) return;
    if (role === UserRole.DESIGNER) return;
    throw new ForbiddenException('Access denied');
  }
}
