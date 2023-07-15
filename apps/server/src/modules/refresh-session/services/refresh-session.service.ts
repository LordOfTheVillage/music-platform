import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RefreshSessionDto } from '../dto/refresh-session.dto';

@Injectable()
export class RefreshSessionService {
  private readonly redisClient: Redis;
  private readonly sessionKeyPrefix = 'session:';
  private readonly sessionsLimit = 5;

  constructor() {
    this.redisClient = new Redis();
  }

  async createRefreshSession(
    sessionObject: RefreshSessionDto
  ): Promise<string> {
    const sessionKey = `${this.sessionKeyPrefix}${sessionObject.refreshToken}`;

    const sessions = await this.redisClient.keys(`${this.sessionKeyPrefix}*`);
    if (sessions.length >= this.sessionsLimit) {
      for (const session of sessions) {
        await this.redisClient.del(session);
      }
    }

    await this.redisClient.hmset(sessionKey, sessionObject);
    return sessionObject.refreshToken;
  }

  async findRefreshSession(refreshToken: string): Promise<RefreshSessionDto> {
    const sessionKey = `${this.sessionKeyPrefix}${refreshToken}`;
    const session = await this.redisClient.hgetall(sessionKey);
    return this.parseRefreshSession(session);
  }

  async findRefreshSessionByFingerprint(
    fingerprint: string
  ): Promise<RefreshSessionDto> {
    const sessions = await this.redisClient.keys(`${this.sessionKeyPrefix}*`);
    for (const session of sessions) {
      const sessionObject = await this.redisClient.hgetall(session);
      if (sessionObject.fingerprint === fingerprint) {
        return this.parseRefreshSession(sessionObject);
      }
    }
    return null;
  }

  async removeRefreshSession(refreshToken: string): Promise<void> {
    const sessionKey = `${this.sessionKeyPrefix}${refreshToken}`;
    await this.redisClient.del(sessionKey);
  }

  parseRefreshSession(
    sessionObject: Record<string, string>
  ): RefreshSessionDto {
    return {
      refreshToken: sessionObject.refreshToken,
      fingerprint: sessionObject.fingerprint,
      userId: Number(sessionObject.userId),
    };
  }
}
