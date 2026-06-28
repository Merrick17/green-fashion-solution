import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@repo/types';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: AuditAction,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action: action as any,
        entity,
        entityId,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
  }

  count(): Promise<number> {
    return this.prisma.auditLog.count();
  }
}
