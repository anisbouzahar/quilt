const test = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');
const {
  ZodValidationPipe,
} = require('../dist/common/pipes/zod-validation.pipe.js');
const { BadRequestException } = require('@nestjs/common');

const SampleSchema = z.object({
  name: z.string().min(2),
  count: z.coerce.number().int().min(1),
});

test('ZodValidationPipe returns validated and parsed data for valid input', () => {
  const pipe = new ZodValidationPipe(SampleSchema);
  const result = pipe.transform(
    { name: 'Quilt', count: '42' },
    { type: 'body' },
  );
  assert.deepEqual(result, { name: 'Quilt', count: 42 });
});

test('ZodValidationPipe throws BadRequestException with structured error list for invalid input', () => {
  const pipe = new ZodValidationPipe(SampleSchema);

  assert.throws(
    () => {
      pipe.transform({ name: 'A', count: -5 }, { type: 'body' });
    },
    (err) => {
      assert.ok(err instanceof BadRequestException);
      const response = err.getResponse();
      assert.equal(response.statusCode, 400);
      assert.equal(response.message, 'Validation failed');
      assert.ok(Array.isArray(response.errors));
      assert.equal(response.errors.length, 2);
      assert.deepEqual(response.errors[0].path, ['name']);
      assert.deepEqual(response.errors[1].path, ['count']);
      return true;
    },
  );
});
