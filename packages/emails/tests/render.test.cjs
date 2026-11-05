const test = require('node:test');
const assert = require('node:assert/strict');

test('verification mail renders Quilt branding, escapes names, and includes a text alternative', async () => {
  const { renderVerificationEmail } = await import('../dist/index.js');
  const { themes } = await import('@quilt/ui/tokens');
  const url = 'https://app.example.com/verify-email?token=fixture&other=value';
  const mail = await renderVerificationEmail({
    name: '<script>alert(1)</script>',
    verificationURL: url,
  });
  assert.match(mail.html, /Quilt/);
  assert.ok(mail.html.includes(themes.light.primary));
  assert.match(mail.html, /&lt;script&gt;/);
  assert.doesNotMatch(mail.html, /<script>/);
  assert.match(mail.html, /Confirm my email/);
  assert.ok(mail.text.includes(url));
  assert.match(mail.text, /one hour/);
  assert.doesNotMatch(mail.text, /<html/);
});

test('mail templates reject unsafe link protocols', async () => {
  const { renderVerificationEmail } = await import('../dist/index.js');
  await assert.rejects(
    renderVerificationEmail({
      name: 'Alex',
      verificationURL: 'javascript:alert(1)',
    }),
  );
});
