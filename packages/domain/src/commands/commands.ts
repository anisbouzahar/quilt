import type { EntityId, Timestamp } from '../primitives/identity';
import type { Money } from '../primitives/money';
import type { LocalDate } from '../primitives/calendar';
import type { Transaction, TransactionAllocation } from '../ledger/transactions';

export interface CommandContext {
  readonly operationId: string;
  readonly workspaceId: EntityId<'workspace'>;
  readonly submittedAt: Timestamp;
}

export type DomainCommand = CommandContext & (
  | { readonly kind: 'create-transaction'; readonly transaction: Transaction }
  | {
      readonly kind: 'replace-allocations';
      readonly transactionId: EntityId<'transaction'>;
      readonly expectedVersion: number;
      readonly allocations: readonly TransactionAllocation[];
    }
  | {
      readonly kind: 'edit-expense-amount';
      readonly transactionId: EntityId<'transaction'>;
      readonly expectedVersion: number;
      readonly amount: Money;
      readonly allocations: readonly TransactionAllocation[];
    }
  | {
      readonly kind: 'add-tag' | 'remove-tag';
      readonly transactionId: EntityId<'transaction'>;
      readonly tagId: EntityId<'tag'>;
    }
  | {
      readonly kind: 'reschedule-occurrence';
      readonly occurrenceId: EntityId<'cash-flow-occurrence'>;
      readonly expectedVersion: number;
      readonly dueOn: LocalDate;
    }
  | {
      readonly kind: 'void-transaction';
      readonly transactionId: EntityId<'transaction'>;
      readonly expectedVersion: number;
      readonly reason: string;
    }
);

export type CommandResult =
  | { readonly kind: 'accepted'; readonly operationId: string }
  | {
      readonly kind: 'conflict';
      readonly operationId: string;
      readonly currentVersion: number;
    }
  | {
      readonly kind: 'rejected';
      readonly operationId: string;
      readonly code: string;
      readonly message: string;
    };

export interface AuditEvent {
  readonly id: EntityId<'audit-event'>;
  readonly workspaceId: EntityId<'workspace'>;
  readonly actorId: EntityId<'user'>;
  readonly operationId: string;
  readonly occurredAt: Timestamp;
  readonly action: string;
  readonly entityId: string;
  readonly beforeVersion: number | null;
  readonly afterVersion: number;
  readonly changeObjectKey: string | null;
}

