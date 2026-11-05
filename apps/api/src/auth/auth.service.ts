import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { createAuth, type AuthInstance } from './auth';

@Injectable()
export class AuthService {
  private _auth?: AuthInstance;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  get auth(): AuthInstance {
    this._auth ??= createAuth(this.databaseService.db, {
      baseURL: this.configService.get<string>('BETTER_AUTH_URL'),
      secret: this.configService.getOrThrow<string>('BETTER_AUTH_SECRET'),
      trustedOrigins:
        this.configService.getOrThrow<string[]>('CORS_ORIGIN_LIST'),
      githubClientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
      githubClientSecret: this.configService.get<string>(
        'GITHUB_CLIENT_SECRET',
      ),
      googleClientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      googleClientSecret: this.configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
      ),
      redisService: this.redisService,
      sendVerificationEmail: (input) =>
        this.mailService.sendVerificationEmail(input),
    });
    return this._auth;
  }
}
