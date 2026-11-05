import { Injectable, Logger, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderVerificationEmail } from '@quilt/emails';
import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService implements OnApplicationShutdown {
  private readonly logger = new Logger(MailService.name);
  private transport?: Transporter<SMTPTransport.SentMessageInfo>;
  constructor(private readonly config: ConfigService) {}

  private getTransport() {
    this.transport ??= nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port: this.config.getOrThrow<number>('SMTP_PORT'),
      secure: this.config.getOrThrow<boolean>('SMTP_SECURE'),
      requireTLS: this.config.getOrThrow<boolean>('SMTP_REQUIRE_TLS'),
      auth: this.config.get<string>('SMTP_USER')
        ? {
            user: this.config.getOrThrow<string>('SMTP_USER'),
            pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
          }
        : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    return this.transport;
  }

  async sendVerificationEmail({
    email,
    name,
    token,
  }: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const url = new URL(
      '/verify-email',
      this.config.getOrThrow<string>('APP_URL'),
    );
    url.searchParams.set('token', token);
    const message = await renderVerificationEmail({
      name,
      verificationURL: url.toString(),
    });
    try {
      const result = await this.getTransport().sendMail({
        from: {
          name: 'Quilt',
          address: this.config.getOrThrow<string>('MAIL_FROM'),
        },
        to: email,
        ...message,
      });
      if (result.rejected?.length) throw new Error('Recipient rejected');
    } catch {
      this.logger.error('Verification email delivery failed.');
      throw new Error(
        'Email delivery is temporarily unavailable. Please try again shortly.',
      );
    }
  }

  onApplicationShutdown() {
    this.transport?.close();
  }
}
