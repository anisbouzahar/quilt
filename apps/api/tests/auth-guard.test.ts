import { describe, it, expect } from 'vitest';
import { AuthGuard } from '../src/auth/guards/auth.guard';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AuthService } from '../src/auth/auth.service';

function fixture(session: unknown) {
  const request: Record<string, unknown> = { headers: {} };
  const guard = new AuthGuard(
    {
      auth: { api: { getSession: async () => session } },
    } as unknown as AuthService,
    { getAllAndOverride: () => false } as unknown as Reflector,
  );
  const context = {
    getHandler: () => {},
    getClass: () => {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { guard, context, request };
}

describe('AuthGuard', () => {
  it('a pre-existing unverified session is refused by protected API endpoints', async () => {
    const { guard, context } = fixture({
      user: { id: 'person', emailVerified: false },
      session: { id: 'old-session' },
    });
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('verified sessions populate the request for downstream authorization', async () => {
    const session = {
      user: { id: 'person', emailVerified: true },
      session: { id: 'session' },
    };
    const { guard, context, request } = fixture(session);
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user).toBe(session.user);
    expect(request.session).toBe(session.session);
  });
});
