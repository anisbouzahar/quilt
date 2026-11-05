import type { LocalDate, YearMonth } from '../primitives/calendar';
import { localDate, yearMonth } from '../primitives/calendar';
import type { CurrencyCode, Money } from '../primitives/money';
import {
  addMoney,
  compareMoney,
  isPositiveMoney,
  money,
} from '../primitives/money';
import type {
  EntityId,
  WorkspaceRecord,
  Timestamp,
} from '../primitives/identity';
import type { Transaction } from '../ledger/transactions';

export type RecurrenceRule =
  | {
      readonly kind: 'weekly';
      readonly everyWeeks: number;
      readonly anchorOn: LocalDate;
    }
  | {
      readonly kind: 'monthly';
      readonly everyMonths: number;
      readonly anchorMonth: YearMonth;
      readonly day: number;
      readonly missingDay: 'last-day' | 'skip';
    }
  | {
      readonly kind: 'twice-monthly';
      readonly days: readonly [number, number];
      readonly missingDay: 'last-day' | 'skip';
    }
  | {
      readonly kind: 'yearly';
      readonly month: number;
      readonly day: number;
      readonly missingDay: 'last-day' | 'skip';
    };

export type AmountExpectation =
  | { readonly kind: 'fixed'; readonly amount: Money }
  | { readonly kind: 'estimate'; readonly amount: Money }
  | { readonly kind: 'unknown'; readonly currency: CurrencyCode };

export interface RecurringCashFlow extends WorkspaceRecord<'cash-flow'> {
  readonly name: string;
  readonly archivedAt: Timestamp | null;
}

/** Immutable once accepted. No automatic historical rewriting. */
export interface CashFlowRevision extends WorkspaceRecord<'cash-flow-revision'> {
  readonly cashFlowId: EntityId<'cash-flow'>;
  readonly direction: 'income' | 'expense';
  readonly effectiveFrom: LocalDate;
  readonly endsOn: LocalDate | null;
  readonly recurrence: RecurrenceRule;
  readonly expectation: AmountExpectation;
  readonly accountId: EntityId<'account'> | null;
  readonly merchantId: EntityId<'merchant'> | null;
  readonly categoryId: EntityId<'category'> | null;
  readonly dateAdjustment: 'none';
}

export interface CashFlowOccurrence extends WorkspaceRecord<'cash-flow-occurrence'> {
  readonly cashFlowId: EntityId<'cash-flow'>;
  readonly revisionId: EntityId<'cash-flow-revision'>;
  readonly occurrenceKey: string;
  readonly originallyScheduledOn: LocalDate;
  readonly dueOn: LocalDate;
  readonly direction: 'income' | 'expense';
  readonly expectation: AmountExpectation;
  readonly disposition:
    | { readonly kind: 'active' }
    | { readonly kind: 'skipped'; readonly reason: string }
    | { readonly kind: 'closed'; readonly reason: string };
}

export interface SettlementAllocation extends WorkspaceRecord<'settlement'> {
  readonly occurrenceId: EntityId<'cash-flow-occurrence'>;
  readonly transactionId: EntityId<'transaction'>;
  readonly amount: Money;
  readonly reversedAt: Timestamp | null;
}

function check(v: boolean, m: string): asserts v {
  if (!v) throw new Error(m);
}

export function expectationCurrency(e: AmountExpectation): CurrencyCode {
  return e.kind === 'unknown' ? e.currency : e.amount.currency;
}

export function validateCashFlowRevision(r: CashFlowRevision): void {
  localDate(r.effectiveFrom);
  if (r.endsOn !== null) {
    localDate(r.endsOn);
    check(r.endsOn >= r.effectiveFrom, 'Invalid end date.');
  }
  if (r.expectation.kind !== 'unknown') {
    check(
      isPositiveMoney(r.expectation.amount),
      'Positive expectation required.',
    );
  }
  const d = (n: number) =>
    check(Number.isInteger(n) && n >= 1 && n <= 31, 'Invalid day.');
  const q = r.recurrence;
  switch (q.kind) {
    case 'weekly':
      localDate(q.anchorOn);
      check(
        Number.isInteger(q.everyWeeks) && q.everyWeeks > 0,
        'Invalid interval.',
      );
      break;
    case 'monthly':
      yearMonth(q.anchorMonth);
      d(q.day);
      check(
        Number.isInteger(q.everyMonths) && q.everyMonths > 0,
        'Invalid interval.',
      );
      break;
    case 'twice-monthly':
      d(q.days[0]);
      d(q.days[1]);
      check(q.days[0] < q.days[1], 'Days must be distinct and ordered.');
      break;
    case 'yearly':
      localDate(
        `2000-${String(q.month).padStart(2, '0')}-${String(q.day).padStart(2, '0')}`,
      );
      break;
  }
}

/** Existing must contain ALL allocations for the payment; server must serialize this check. */
export function validateSettlement(
  a: SettlementAllocation,
  o: CashFlowOccurrence,
  t: Transaction,
  existing: readonly SettlementAllocation[],
): void {
  check(a.reversedAt === null, 'New allocation must be active.');
  check(
    a.workspaceId === o.workspaceId && a.workspaceId === t.workspaceId,
    'Workspace mismatch.',
  );
  check(
    a.occurrenceId === o.id && a.transactionId === t.id,
    'Reference mismatch.',
  );
  check(o.disposition.kind === 'active', 'Occurrence not active.');
  check(t.kind === 'income' || t.kind === 'expense', 'Invalid payment type.');
  check(
    t.kind === o.direction && t.status === 'booked' && t.voidedAt === null,
    'Invalid payment.',
  );
  check(isPositiveMoney(a.amount), 'Positive allocation required.');
  check(
    a.amount.currency === t.amount.currency &&
      a.amount.currency === expectationCurrency(o.expectation),
    'Currency mismatch.',
  );
  let total = a.amount;
  for (const e of existing) {
    check(
      e.workspaceId === a.workspaceId && e.transactionId === a.transactionId,
      'Allocation scope mismatch.',
    );
    if (e.id !== a.id && e.reversedAt === null)
      total = addMoney(total, e.amount);
  }
  check(compareMoney(total, t.amount) <= 0, 'Payment overallocated.');
}

export function occurrenceProgress(
  o: CashFlowOccurrence,
  rows: readonly SettlementAllocation[],
) {
  let settled = money('0', expectationCurrency(o.expectation));
  const seen = new Set<string>();
  for (const a of rows) {
    check(
      a.workspaceId === o.workspaceId && a.occurrenceId === o.id,
      'Allocation scope mismatch.',
    );
    check(!seen.has(a.id), 'Duplicate allocation.');
    seen.add(a.id);
    if (a.reversedAt === null) settled = addMoney(settled, a.amount);
  }
  const status =
    o.disposition.kind !== 'active'
      ? o.disposition.kind
      : o.expectation.kind !== 'unknown' &&
          compareMoney(settled, o.expectation.amount) >= 0
        ? 'covered'
        : isPositiveMoney(settled)
          ? 'partial'
          : 'open';
  return { settled, status };
}
