import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private lastRedisErrorLogAt = 0;
  readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.client.on('error', (error) => {
      const now = Date.now();
      if (now - this.lastRedisErrorLogAt >= 15000) {
        this.lastRedisErrorLogAt = now;
        this.logger.warn(`Redis unavailable: ${error.message}`);
      }
    });
  }

  async get(key: string) {
    try {
      await this.ensureConnected();
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    try {
      await this.ensureConnected();
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      }
      await this.client.set(key, value);
    } catch {
      return;
    }
  }

  async setNx(key: string, value: string, ttlSeconds: number) {
    try {
      await this.ensureConnected();
      const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return true;
    }
  }

  async del(key: string) {
    try {
      await this.ensureConnected();
      await this.client.del(key);
    } catch {
      return;
    }
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    try {
      await this.ensureConnected();
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      return null;
    }
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  private async ensureConnected() {
    if (
      this.client.status === 'wait' ||
      this.client.status === 'reconnecting' ||
      this.client.status === 'end'
    ) {
      await this.client.connect();
    }
  }
}
