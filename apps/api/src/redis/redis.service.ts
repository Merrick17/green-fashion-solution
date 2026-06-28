import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import {
  AUTH_TTL,
  refreshTokenKey,
  refreshTokenKeysPattern,
} from '../auth/auth-constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;
  private disabled = false;

  constructor() {
    const url = process.env.REDIS_URL?.trim();
    if (!url) {
      this.client = null;
      return;
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2_000,
      retryStrategy: () => null,
    });

    this.client.on('error', (err) => {
      if (!this.disabled) {
        this.logger.warn(
          `Redis unavailable (${err.message}) — auth continues without refresh-token revocation.`,
        );
      }
      this.disabled = true;
    });
  }

  onModuleDestroy() {
    void this.client?.quit();
  }

  isAvailable(): boolean {
    return this.client !== null && !this.disabled;
  }

  getClient(): Redis | null {
    return this.isAvailable() ? this.client : null;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async run<T>(operation: (client: Redis) => Promise<T>, fallback: T): Promise<T> {
    if (!this.client || this.disabled) return fallback;
    try {
      return await operation(this.client);
    } catch (err) {
      this.disabled = true;
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis operation skipped: ${message}`);
      return fallback;
    }
  }

  async storeRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds = AUTH_TTL.REFRESH_SECONDS,
  ) {
    await this.run(async (client) => {
      const key = refreshTokenKey(userId, this.hashToken(refreshToken));
      await client.set(key, '1', 'EX', ttlSeconds);
    }, undefined);
  }

  async revokeRefreshToken(userId: string, refreshToken: string) {
    await this.run(async (client) => {
      const key = refreshTokenKey(userId, this.hashToken(refreshToken));
      await client.del(key);
    }, undefined);
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.run(async (client) => {
      const keys = await client.keys(refreshTokenKeysPattern(userId));
      if (keys.length) await client.del(...keys);
    }, undefined);
  }

  async isRefreshTokenValid(userId: string, refreshToken: string): Promise<boolean> {
    return this.run(async (client) => {
      const key = refreshTokenKey(userId, this.hashToken(refreshToken));
      const exists = await client.exists(key);
      return exists === 1;
    }, true);
  }
}
