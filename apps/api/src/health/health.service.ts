import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GraphService } from '../graph/graph.service';
import { EmailService } from '../email/email.service';
import { StorageService } from '../files/storage.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly graph: GraphService,
    private readonly email: EmailService,
    private readonly storage: StorageService,
  ) {}

  async check() {
    const db = await this.pingDb();
    return {
      status: db ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database: db ? 'up' : 'down' },
    };
  }

  async ready() {
    const db = await this.pingDb();
    const redis = await this.pingRedis();
    const ok = db && redis;
    return {
      status: ok ? 'ready' : 'not_ready',
      integrations: {
        storage: this.storage.provider(),
        graph: this.graph.isConfigured(),
        email: this.email.isConfigured(),
      },
    };
  }

  private async pingDb(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async pingRedis(): Promise<boolean> {
    try {
      const client = this.redis.getClient();
      if (!client) return true;
      await client.ping();
      return true;
    } catch {
      return false;
    }
  }
}
