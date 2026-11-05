import { Injectable, Logger, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private _client?: Redis;

  constructor(private readonly config: ConfigService) {}

  get client(): Redis {
    if (!this._client) {
      const url = this.config.getOrThrow<string>('REDIS_URL');

      this._client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Avoid spamming reconnects if server is unavailable in development
          }
          return Math.min(times * 200, 1000);
        },
      });

      this._client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });
    }

    return this._client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis set failed for key "${key}": ${msg}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis del failed for key "${key}": ${msg}`);
    }
  }

  async getAndDelete(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      if (value !== null) {
        await this.client.del(key);
      }
      return value;
    } catch {
      return null;
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const count = await this.client.incr(key);
      if (ttlSeconds && count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      return 1;
    }
  }

  async onApplicationShutdown() {
    if (this._client) {
      try {
        await this._client.quit();
      } catch {
        this._client.disconnect();
      }
    }
  }
}
