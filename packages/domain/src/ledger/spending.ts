import {
  addMoney,
  money,
  subtractMoney,
  type CurrencyCode,
  type Money,
} from '../primitives/money';
import type { Transaction } from './transactions';
import type { EntityId } from '../primitives/identity';

/** Actual spending only. Keep currencies separate until a reporting policy converts them. */
export function spendingByCurrency(
  workspaceId: EntityId<'workspace'>,
  transactions: readonly Transaction[],
): readonly Money[] {
  const seen = new Set<string>();
  const totals = new Map<CurrencyCode, Money>();
  for (const transaction of transactions) {
    if (transaction.workspaceId !== workspaceId)
      throw new Error('A spending summary cannot mix workspaces.');
    if (seen.has(transaction.id))
      throw new Error(
        'A transaction must appear only once in a spending summary.',
      );
    seen.add(transaction.id);
    if (
      transaction.status !== 'booked' ||
      transaction.voidedAt !== null ||
      transaction.kind === 'transfer' ||
      transaction.kind === 'adjustment' ||
      transaction.kind === 'income'
    )
      continue;
    const previous =
      totals.get(transaction.amount.currency) ??
      money('0', transaction.amount.currency);
    totals.set(
      transaction.amount.currency,
      transaction.kind === 'refund'
        ? subtractMoney(previous, transaction.amount)
        : addMoney(previous, transaction.amount),
    );
  }
  return [...totals.values()];
}

