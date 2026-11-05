import { createElement } from 'react';
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
  return {
    subject: 'Confirm your email for Quilt',
    html,
    text: toPlainText(html),
  };
}
