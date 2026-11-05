import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabase } from '@quilt/db';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private connection?: ReturnType<typeof createDatabase>;

  constructor(private readonly config: ConfigService) {}

  get db() {
    // Connect only when a feature actually needs the database.
    this.connection ??= createDatabase(
      this.config.getOrThrow<string>('DATABASE_URL'),
    );
    return this.connection.db;
  }

  async onApplicationShutdown() {
    await this.connection?.pool.end();
  }
}
