import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { emailLogoCid } from '@quilt/ui/email';
import { render, toPlainText } from 'react-email';
import {
  VerificationEmail,
  type VerificationEmailProps,
} from './verification-email.js';
export {
  VerificationEmail,
  type VerificationEmailProps,
} from './verification-email.js';

export async function renderVerificationEmail(props: VerificationEmailProps) {
  const url = new URL(props.verificationURL);
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    throw new Error('Email links must use HTTP or HTTPS.');
  const html = await render(createElement(VerificationEmail, props));
  const logo = await readFile(
    new URL('../assets/quilt-logo.png', import.meta.url),
  );
  return {
    subject: 'Confirm your email for Quilt',
    html,
    text: toPlainText(html),
    attachments: [
      {
        filename: 'quilt-logo.png',
        content: logo,
        contentType: 'image/png',
        contentDisposition: 'inline' as const,
        cid: emailLogoCid,
      },
    ],
  };
}
