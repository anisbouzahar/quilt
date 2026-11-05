import type { LocalDate } from '../primitives/calendar';
import { localDate } from '../primitives/calendar';
import type {
  EntityId,
  Timestamp,
  WorkspaceRecord,
} from '../primitives/identity';
import type { ConversionQuote, Money } from '../primitives/money';
import {
  addMoney,
  compareMoney,
  isPositiveMoney,
  money,
} from '../primitives/money';
import type { Category, FinancialAccount, Merchant, Tag } from './catalog';

export type TransactionOrigin = 'manual' | 'import' | 'receipt' | 'adjustment';

interface TransactionBase extends WorkspaceRecord<'transaction'> {
  readonly occurredOn: LocalDate;
  readonly status: 'pending' | 'booked';
  readonly bookedOn: LocalDate | null;
  readonly note: string | null;
  readonly tagIds: readonly EntityId<'tag'>[];
  readonly creationOrigin: TransactionOrigin;
  readonly voidedAt: Timestamp | null;
}
export interface TransactionAllocation {
  /** Unique within its transaction. */
  readonly key: string;
  readonly categoryId: EntityId<'category'> | null;
  readonly amount: Money;
}
interface CategorizedTransaction extends TransactionBase {
  readonly accountId: EntityId<'account'>;
  /** Positive magnitude; kind defines the direction. */
  readonly amount: Money;
  readonly merchantId: EntityId<'merchant'> | null;
  readonly allocations: readonly TransactionAllocation[];
}
export interface ExpenseTransaction extends CategorizedTransaction {
  readonly kind: 'expense';
}
export interface IncomeTransaction extends CategorizedTransaction {
  readonly kind: 'income';
}
export interface RefundTransaction extends CategorizedTransaction {
  readonly kind: 'refund';
  readonly refundOf: EntityId<'transaction'> | null;
}
export interface TransferLeg {
  readonly accountId: EntityId<'account'>;
  readonly amount: Money;
}
/** One atomic movement; never represent these legs as two household expenses. */
export interface TransferTransaction extends TransactionBase {
  readonly kind: 'transfer';
  readonly debit: TransferLeg;
  readonly credit: TransferLeg;
  /** Optional supporting quote; the explicit leg amounts are authoritative. */
  readonly conversionQuote: ConversionQuote | null;
}
export type Transaction =
  | ExpenseTransaction
  | IncomeTransaction
  | RefundTransaction
  | TransferTransaction
  | AdjustmentTransaction;

export interface AdjustmentTransaction extends TransactionBase {
  readonly kind: 'adjustment';
  readonly accountId: EntityId<'account'>;
  readonly delta: Money;
  readonly reason: string;
}

export interface TransactionReferences {
  readonly accounts: readonly FinancialAccount[];
  readonly categories: readonly Category[];
  readonly merchants: readonly Merchant[];
  readonly tags: readonly Tag[];
  readonly refundedExpense?: ExpenseTransaction;
}

function requireRule(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function requireScope(
  actual: EntityId<'workspace'>,
  expected: EntityId<'workspace'>,
) {
  requireRule(
    actual === expected,
    'A referenced record belongs to another workspace.',
  );
}

/** Validate domain relationships after boundary parsing, before accepting a write. */
export function validateTransaction(
  transaction: Transaction,
  references: TransactionReferences,
): void {
  localDate(transaction.occurredOn);
  const accountFor = (id: EntityId<'account'>, amount: Money) => {
    const account = references.accounts.find(
      (candidate) => candidate.id === id,
    );
    requireRule(!!account, 'The financial account does not exist.');
    requireScope(account.workspaceId, transaction.workspaceId);
    requireRule(
      account.currency === amount.currency,
      'Transaction currency must match its account.',
    );
    requireRule(
      isPositiveMoney(amount),
      'Transaction amounts must be positive magnitudes.',
    );
  };
  if (transaction.bookedOn !== undefined && transaction.bookedOn !== null) {
    localDate(transaction.bookedOn);
  }
  if (transaction.kind === 'adjustment') {
    const account = references.accounts.find(
      (a) => a.id === transaction.accountId,
    );
    requireRule(!!account, 'Account missing.');
    requireScope(account.workspaceId, transaction.workspaceId);
    requireRule(
      account.currency === transaction.delta.currency,
      'Currency mismatch.',
    );
    requireRule(
      compareMoney(transaction.delta, money('0', account.currency)) !== 0,
      'Zero adjustment.',
    );
    requireRule(!!transaction.reason.trim(), 'Reason required.');
    return;
  }
  requireRule(
    new Set(transaction.tagIds).size === transaction.tagIds.length,
    'A transaction cannot repeat a tag.',
  );
  for (const tagId of transaction.tagIds) {
    const tag = references.tags.find((candidate) => candidate.id === tagId);
    requireRule(!!tag, 'The tag does not exist.');
    requireScope(tag.workspaceId, transaction.workspaceId);
  }
  if (transaction.kind === 'transfer') {
    requireRule(
      transaction.debit.accountId !== transaction.credit.accountId,
      'A transfer needs two distinct accounts.',
    );
    accountFor(transaction.debit.accountId, transaction.debit.amount);
    accountFor(transaction.credit.accountId, transaction.credit.amount);
    if (
      transaction.debit.amount.currency === transaction.credit.amount.currency
    ) {
      requireRule(
        compareMoney(transaction.debit.amount, transaction.credit.amount) === 0,
        'Same-currency transfer legs must balance; record fees as expenses.',
      );
    }
    const quote = transaction.conversionQuote;
    if (quote) {
      requireRule(
        quote.baseCurrency === transaction.debit.amount.currency &&
          quote.quoteCurrency === transaction.credit.amount.currency,
        'Transfer quote currencies must match its legs.',
      );
      requireRule(
        isPositiveMoney({ amount: quote.rate, currency: quote.baseCurrency }) &&
          !!quote.source.trim() &&
          !!quote.asOf &&
          !!quote.retrievedAt,
        'A transfer quote needs a positive rate and provenance.',
      );
    }
    return;
  }
  accountFor(transaction.accountId, transaction.amount);
  if (transaction.merchantId !== null) {
    const merchant = references.merchants.find(
      (candidate) => candidate.id === transaction.merchantId,
    );
    requireRule(!!merchant, 'The merchant does not exist.');
    requireScope(merchant.workspaceId, transaction.workspaceId);
  }
  requireRule(
    transaction.allocations.length > 0,
    'Allocate the whole amount, using a null category when uncategorized.',
  );
  requireRule(
    new Set(transaction.allocations.map((allocation) => allocation.key))
      .size === transaction.allocations.length,
    'Allocation keys must be unique.',
  );
  let total = money('0', transaction.amount.currency);
  for (const allocation of transaction.allocations) {
    requireRule(!!allocation.key.trim(), 'An allocation needs a nonempty key.');
    requireRule(
      isPositiveMoney(allocation.amount),
      'Allocation amounts must be positive.',
    );
    total = addMoney(total, allocation.amount);
    if (allocation.categoryId !== null) {
      const category = references.categories.find(
        (candidate) => candidate.id === allocation.categoryId,
      );
      requireRule(!!category, 'The category does not exist.');
      requireScope(category.workspaceId, transaction.workspaceId);
      requireRule(
        category.kind ===
          (transaction.kind === 'income' ? 'income' : 'expense'),
        'The category kind does not match the transaction.',
      );
    }
  }
  requireRule(
    compareMoney(total, transaction.amount) === 0,
    'Allocations must sum exactly to the transaction amount.',
  );
  if (transaction.kind === 'refund' && transaction.refundOf !== null) {
    const expense = references.refundedExpense;
    requireRule(
      !!expense && expense.id === transaction.refundOf,
      'The original expense must be supplied for a linked refund.',
    );
    requireScope(expense.workspaceId, transaction.workspaceId);
    requireRule(
      expense.amount.currency === transaction.amount.currency,
      'A linked refund must use the original expense currency.',
    );
    requireRule(
      expense.voidedAt === null,
      'A linked refund cannot refer to a voided expense.',
    );
  }
}
