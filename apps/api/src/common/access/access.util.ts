import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@repo/types';
import type { PrismaService } from '../../prisma/prisma.service';

type MoodboardWithProject = NonNullable<
  Awaited<
    ReturnType<
      PrismaService['moodboard']['findUnique']
    >
  >
> & { project: NonNullable<Awaited<ReturnType<PrismaService['project']['findUnique']>>> };

type ProjectRecord = NonNullable<
  Awaited<ReturnType<PrismaService['project']['findUnique']>>
>;

export async function assertMoodboardAccess(
  prisma: PrismaService,
  moodboardId: string,
  userId: string,
  role: string,
  options?: { designerMessage?: string },
): Promise<MoodboardWithProject> {
  const moodboard = await prisma.moodboard.findUnique({
    where: { id: moodboardId },
    include: { project: true },
  });
  if (!moodboard) throw new NotFoundException('Moodboard not found');

  switch (role) {
    case UserRole.ADMIN:
      return moodboard as MoodboardWithProject;
    case UserRole.DESIGNER:
      throw new ForbiddenException(
        options?.designerMessage ?? 'Designers cannot access moodboards',
      );
    case UserRole.CUSTOMER:
      if (moodboard.project.customerId === userId) {
        return moodboard as MoodboardWithProject;
      }
      break;
  }

  throw new ForbiddenException('Access denied');
}

export async function assertProjectAccess(
  prisma: PrismaService,
  projectId: string,
  userId: string,
  role: string,
): Promise<ProjectRecord> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundException('Project not found');

  switch (role) {
    case UserRole.ADMIN:
      return project;
    case UserRole.CUSTOMER:
      if (project.customerId === userId) return project;
      break;
  }

  throw new ForbiddenException('Access denied');
}

export async function dispatchByRole<T>(
  role: string,
  handlers: {
    admin: () => T | Promise<T>;
    designer: () => T | Promise<T>;
    customer: () => T | Promise<T>;
  },
): Promise<T> {
  switch (role) {
    case UserRole.ADMIN:
      return handlers.admin();
    case UserRole.DESIGNER:
      return handlers.designer();
    case UserRole.CUSTOMER:
      return handlers.customer();
    default:
      throw new ForbiddenException('Access denied');
  }
}
