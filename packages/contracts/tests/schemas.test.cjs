const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CreateOrganizationSchema,
  InviteMemberSchema,
  SignUpWithEmailSchema,
  PaginationQuerySchema,
} = require('../dist/index.js');

test('CreateOrganizationSchema validates correct organization payloads', () => {
  const result = CreateOrganizationSchema.safeParse({
    name: 'Acme Household',
    slug: 'acme-household',
    logo: 'https://example.com/logo.png',
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, 'Acme Household');
    assert.equal(result.data.slug, 'acme-household');
  }
});

test('CreateOrganizationSchema rejects empty names and invalid slugs', () => {
  const emptyNameResult = CreateOrganizationSchema.safeParse({
    name: '   ',
  });
  assert.equal(emptyNameResult.success, false);

  const invalidSlugResult = CreateOrganizationSchema.safeParse({
    name: 'Valid Name',
    slug: 'INVALID SLUG WITH SPACES',
  });
  assert.equal(invalidSlugResult.success, false);
});

test('InviteMemberSchema validates email and role', () => {
  const valid = InviteMemberSchema.safeParse({
    email: 'member@example.com',
    role: 'admin',
  });
  assert.equal(valid.success, true);

  const invalidEmail = InviteMemberSchema.safeParse({
    email: 'not-an-email',
  });
  assert.equal(invalidEmail.success, false);

  const invalidRole = InviteMemberSchema.safeParse({
    email: 'test@example.com',
    role: 'superadmin',
  });
  assert.equal(invalidRole.success, false);
});

test('SignUpWithEmailSchema requires 8+ char password and valid email', () => {
  const valid = SignUpWithEmailSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securepassword123',
  });
  assert.equal(valid.success, true);

  const shortPassword = SignUpWithEmailSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'short',
  });
  assert.equal(shortPassword.success, false);
});

test('PaginationQuerySchema coerces strings and provides defaults', () => {
  const parsedDefault = PaginationQuerySchema.parse({});
  assert.equal(parsedDefault.page, 1);
  assert.equal(parsedDefault.limit, 20);

  const parsedCoerced = PaginationQuerySchema.parse({
    page: '3',
    limit: '50',
  });
  assert.equal(parsedCoerced.page, 3);
  assert.equal(parsedCoerced.limit, 50);
});
