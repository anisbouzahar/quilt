import { HouseholdSchema, type Household } from '@quilt/contracts';
import type { RawAuthClient } from './auth-client';
import { ClientError, throwResponseError } from './errors';

export type { Household };

export function createHouseholdsApi(authClient: RawAuthClient) {
  return {
    async list(): Promise<Household[]> {
      const result = await authClient.organization.list();
      throwResponseError(result.error);
      return HouseholdSchema.array().parse(result.data ?? []);
    },
    async create(name: string): Promise<Household> {
      const result = await authClient.organization.create({
        name,
        slug: `home-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      });
      throwResponseError(result.error);
      if (!result.data) {
        throw new ClientError('Household could not be created.');
      }
      return HouseholdSchema.parse(result.data);
    },
  };
}

export type HouseholdsApi = ReturnType<typeof createHouseholdsApi>;
