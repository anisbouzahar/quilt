import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidationPipe } from '../src/common/pipes/zod-validation.pipe';
import { BadRequestException } from '@nestjs/common';

const SampleSchema = z.object({
  name: z.string().min(2),
  count: z.coerce.number().int().min(1),
});

describe('ZodValidationPipe', () => {
  it('returns validated and parsed data for valid input', () => {
    const pipe = new ZodValidationPipe(SampleSchema);
    const result = pipe.transform(
      { name: 'Quilt', count: '42' },
      { type: 'body' },
    );
    expect(result).toEqual({ name: 'Quilt', count: 42 });
  });

  it('throws BadRequestException with structured error list for invalid input', () => {
    const pipe = new ZodValidationPipe(SampleSchema);

    expect(() => {
      pipe.transform({ name: 'A', count: -5 }, { type: 'body' });
    }).toThrowError(BadRequestException);

    try {
      pipe.transform({ name: 'A', count: -5 }, { type: 'body' });
    } catch (err) {
      expect(err instanceof BadRequestException).toBe(true);
      const response = (err as BadRequestException).getResponse() as {
        statusCode: number;
        message: string;
        errors: Array<{ path: string[] }>;
      };
      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('Validation failed');
      expect(Array.isArray(response.errors)).toBe(true);
      expect(response.errors.length).toBe(2);
      expect(response.errors[0]?.path).toEqual(['name']);
      expect(response.errors[1]?.path).toEqual(['count']);
    }
  });
});
