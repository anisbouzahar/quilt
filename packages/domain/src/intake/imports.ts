import type { EntityId, WorkspaceRecord } from '../primitives/identity';

export interface ImportBatch extends WorkspaceRecord<'import-batch'> {
  readonly fileName: string;
  readonly sourceObjectKey: string;
  readonly sourceFingerprint: string;
  readonly status: 'review' | 'processing' | 'completed' | 'failed';
}

export type ImportDecision =
  | { readonly kind: 'unreviewed' }
  | {
      readonly kind: 'created';
      readonly transactionId: EntityId<'transaction'>;
    }
  | {
      readonly kind: 'matched';
      readonly transactionId: EntityId<'transaction'>;
    }
  | { readonly kind: 'ignored'; readonly reason: string }
  | { readonly kind: 'rejected'; readonly reason: string };

export interface ImportRow extends WorkspaceRecord<'import-row'> {
  readonly batchId: EntityId<'import-batch'>;
  /** Source identity is distinct from fuzzy duplicate or financial matching. */
  readonly sourceRecordId: string | null;
  readonly accountId: EntityId<'account'>;
  readonly sourceFingerprint: string;
  readonly sourceObjectKey: string;
  readonly decision: ImportDecision;
}

