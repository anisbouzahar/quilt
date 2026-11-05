import type { FinancialAccount } from './catalog';
import type { Transaction } from './transactions';
import type { LocalDate } from '../primitives/calendar';
import { localDate } from '../primitives/calendar';
import { addMoney, subtractMoney } from '../primitives/money';

/** Requires complete history. Opening balance is END OF DAY on openingBalanceDate. */
export function accountBalance(
  account: FinancialAccount,
  transactions: readonly Transaction[],
  asOf: LocalDate,
) {
  localDate(asOf);
  if (asOf < account.openingBalanceDate)
    throw new Error('Before opening checkpoint.');
  let balance = account.openingBalance;
  const seen = new Set<string>();
  for (const t of transactions) {
    if (t.workspaceId !== account.workspaceId)
      throw new Error('Workspace mismatch.');
    if (seen.has(t.id)) throw new Error('Duplicate transaction.');
    seen.add(t.id);
    if (t.voidedAt !== null || t.status !== 'booked') continue;
    if (t.bookedOn === null) throw new Error('Missing booking date.');
    if (t.bookedOn <= account.openingBalanceDate || t.bookedOn > asOf) continue;
    if (t.kind === 'transfer') {
      if (t.debit.accountId === account.id)
        balance = subtractMoney(balance, t.debit.amount);
      if (t.credit.accountId === account.id)
        balance = addMoney(balance, t.credit.amount);
    } else if (t.accountId === account.id) {
      balance =
        t.kind === 'adjustment'
          ? addMoney(balance, t.delta)
          : t.kind === 'expense'
            ? subtractMoney(balance, t.amount)
            : addMoney(balance, t.amount);
    }
  }
  return balance;
}

