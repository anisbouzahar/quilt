import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { createAuth, type AuthInstance } from './auth';

@Injectable()
export class AuthService {
  private _auth?: AuthInstance;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  get auth(): AuthInstance {
    this._auth ??= createAuth(this.databaseService.db, {
      baseURL: this.configService.get<string>('BETTER_AUTH_URL'),
      secret: this.configService.getOrThrow<string>('BETTER_AUTH_SECRET'),
      githubClientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
      githubClientSecret: this.configService.get<string>(
        'GITHUB_CLIENT_SECRET',
      ),
      googleClientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      googleClientSecret: this.configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
      redisService: this.redisService,
    });
    return this._auth;
  }
}
