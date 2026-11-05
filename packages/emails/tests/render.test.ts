import { describe, it, expect } from 'vitest';
import { renderVerificationEmail } from '../src';
import { themes } from '@quilt/ui/tokens';

describe('Verification Email Rendering', () => {
  it('verification mail renders Quilt branding, escapes names, and includes a text alternative', async () => {
    const url =
      'https://app.example.com/verify-email?token=fixture&other=value';
    const mail = await renderVerificationEmail({
      name: '<script>alert(1)</script>',
      verificationURL: url,
    });
    expect(mail.html).toMatch(/Quilt/);
    expect(mail.html.includes(themes.light.primary)).toBe(true);
    expect(mail.html).toMatch(/&lt;script&gt;/);
    expect(mail.html).not.toMatch(/<script>/);
    expect(mail.html).toMatch(/Confirm my email/);
    expect(mail.text.includes(url)).toBe(true);
    expect(mail.text).toMatch(/one hour/);
    expect(mail.text).not.toMatch(/<html/);
  });

  it('mail templates reject unsafe link protocols', async () => {
    await expect(
      renderVerificationEmail({
        name: 'Alex',
        verificationURL: 'javascript:alert(1)',
      }),
    ).rejects.toThrow();
  });
});
