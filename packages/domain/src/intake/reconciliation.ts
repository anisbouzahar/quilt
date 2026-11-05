import type { LocalDate } from '../primitives/calendar';
import type {
  EntityId,
  WorkspaceRecord,
  Timestamp,
} from '../primitives/identity';
import type { Money } from '../primitives/money';

export interface Reconciliation extends WorkspaceRecord<'reconciliation'> {
  readonly accountId: EntityId<'account'>;
  readonly statementOn: LocalDate;
  readonly statementBalance: Money;
  readonly state:
    | { readonly kind: 'draft' }
    | {
        readonly kind: 'completed';
        readonly completedAt: Timestamp;
        readonly completedBy: EntityId<'user'>;
        readonly calculatedBalance: Money;
      };
}

export interface ReconciliationItem extends WorkspaceRecord<'reconciliation-item'> {
  readonly reconciliationId: EntityId<'reconciliation'>;
  readonly transactionId: EntityId<'transaction'>;
  readonly transactionVersion: number;
}
