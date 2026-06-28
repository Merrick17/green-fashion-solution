import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

const DEFAULT_TTL = 60;

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const client = this.redis.getClient();
    if (!client) return null;
    try {
      const raw = await client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache get failed for key "${key}": ${String(err)}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Cache set failed for key "${key}": ${String(err)}`);
    }
  }

  async del(key: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;
    try {
      await client.del(key);
    } catch (err) {
      this.logger.warn(`Cache del failed for key "${key}": ${String(err)}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;
    try {
      const keys = await client.keys(pattern);
      if (keys.length) await client.del(...keys);
    } catch (err) {
      this.logger.warn(`Cache delByPattern failed for pattern "${pattern}": ${String(err)}`);
    }
  }
}
