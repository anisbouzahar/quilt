import type { CurrencyCode, Money } from '../primitives/money';
import type { LocalDate } from '../primitives/calendar';
import { localDate } from '../primitives/calendar';
import type { Timestamp, WorkspaceRecord } from '../primitives/identity';

/** All accounts are shared within the workspace; personal/private accounts are unmodeled. */
export interface FinancialAccount extends WorkspaceRecord<'account'> {
  readonly name: string;
  readonly kind: 'cash' | 'bank' | 'credit-card';
  readonly currency: CurrencyCode;
  /** Signed net asset value: liabilities can have a negative opening balance. */
  readonly openingBalance: Money;
  readonly openingBalanceDate: LocalDate;
  readonly archivedAt: Timestamp | null;
}
export interface Merchant extends WorkspaceRecord<'merchant'> {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly archivedAt: Timestamp | null;
}
export interface Category extends WorkspaceRecord<'category'> {
  readonly name: string;
  readonly kind: 'expense' | 'income';
  readonly archivedAt: Timestamp | null;
}
export interface Tag extends WorkspaceRecord<'tag'> {
  readonly name: string;
  readonly archivedAt: Timestamp | null;
}

export function validateAccount(account: FinancialAccount): void {
  if (account.openingBalance.currency !== account.currency) {
    throw new Error('Opening balance must use the account currency.');
  }
  localDate(account.openingBalanceDate);
}
