import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!) || 6379,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  async getValue<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error('Failed to parse JSON from Redis', e);
        return null;
      }
    }
    return null;
  }

  async setValue<T>(key: string, value: T): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
