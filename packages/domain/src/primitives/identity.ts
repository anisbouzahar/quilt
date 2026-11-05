/** Opaque identifiers are serialized as strings; their format is owned by adapters. */
export type EntityKind =
  | 'user'
  | 'workspace'
  | 'membership'
  | 'account'
  | 'transaction'
  | 'merchant'
  | 'category'
  | 'tag'
  | 'budget'
  | 'budget-line'
  | 'goal'
  | 'goal-contribution'
  | 'cash-flow'
  | 'cash-flow-revision'
  | 'cash-flow-occurrence'
  | 'settlement'
  | 'evidence-link'
  | 'reconciliation'
  | 'reconciliation-item'
  | 'audit-event'
  | 'import-batch'
  | 'import-row'
  | 'receipt'
  | 'extraction-job'
  | 'extraction-result'
  | 'expense-draft';

declare const entityBrand: unique symbol;
export type EntityId<Kind extends EntityKind> = string & {
  readonly [entityBrand]: Kind;
};

export function entityId<Kind extends EntityKind>(
  value: string,
): EntityId<Kind> {
  if (!value || value.trim() !== value || /\s/.test(value)) {
    throw new Error(
      'An entity identifier must be a nonempty string without whitespace.',
    );
  }
  return value as EntityId<Kind>;
}

/** UTC ISO-8601 instant, supplied and validated by the persistence/API adapter. */
export type Timestamp = string;
export interface RecordMetadata {
  readonly version: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: EntityId<'user'>;
  readonly updatedBy: EntityId<'user'>;
}
export interface WorkspaceRecord<
  Kind extends EntityKind,
> extends RecordMetadata {
  readonly id: EntityId<Kind>;
  readonly workspaceId: EntityId<'workspace'>;
}

