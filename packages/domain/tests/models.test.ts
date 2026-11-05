import { describe, it, expect } from 'vitest';
import {
  entityId,
  money,
  localDate,
  yearMonth,
  monthlyBillDate,
  hasWorkspacePermission,
  validateAccount,
  validateTransaction,
  validateBudget,
  validateGoal,
  spendingByCurrency,
  type Account,
  type Category,
  type Merchant,
  type Tag,
  type Expense,
  type Transfer,
  type Refund,
  type WorkspaceBudget,
  type WorkspaceGoal,
  type WorkspaceMembership,
} from '../src';

describe('Domain Models', () => {
  const metadata = {
    version: 1,
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    createdBy: entityId('alex'),
    updatedBy: entityId('alex'),
    workspaceId: entityId('home'),
  };

  const eur: Account = {
    ...metadata,
    id: entityId('eur-account'),
    name: 'Shared bank',
    kind: 'bank',
    currency: 'EUR',
    openingBalance: money('0', 'EUR'),
    openingBalanceDate: localDate('2026-01-01'),
    archivedAt: null,
  };

  const usd: Account = {
    ...eur,
    id: entityId('usd-account'),
    currency: 'USD',
    openingBalance: money('0', 'USD'),
  };

  const category: Category = {
    ...metadata,
    id: entityId('groceries'),
    name: 'Groceries',
    kind: 'expense',
    archivedAt: null,
  };

  const merchant: Merchant = {
    ...metadata,
    id: entityId('shop'),
    name: 'Shop',
    aliases: [],
    archivedAt: null,
  };

  const tag: Tag = {
    ...metadata,
    id: entityId('shared'),
    name: 'Shared',
    archivedAt: null,
  };

  const references = {
    accounts: [eur, usd],
    categories: [category],
    merchants: [merchant],
    tags: [tag],
  };

  const expense: Expense = {
    ...metadata,
    id: entityId('expense'),
    kind: 'expense',
    occurredOn: localDate('2026-11-05'),
    status: 'booked',
    note: null,
    tagIds: [tag.id],
    source: { kind: 'manual' },
    voidedAt: null,
    accountId: eur.id,
    amount: money('0.3', 'EUR'),
    merchantId: merchant.id,
    allocations: [
      { key: 'food', categoryId: category.id, amount: money('0.1', 'EUR') },
      { key: 'other', categoryId: null, amount: money('0.2', 'EUR') },
    ],
  };

  const transfer: Transfer = {
    ...metadata,
    id: entityId('transfer'),
    kind: 'transfer',
    occurredOn: expense.occurredOn,
    status: 'booked',
    note: null,
    tagIds: [],
    source: { kind: 'manual' },
    voidedAt: null,
    debit: { accountId: eur.id, amount: money('10', 'EUR') },
    credit: { accountId: usd.id, amount: money('11', 'USD') },
    conversionQuote: null,
  };

  it('identifiers reject empty or whitespace-bearing values', () => {
    for (const input of ['', ' ', 'two ids', ' padded']) {
      expect(() => entityId(input)).toThrow();
    }
  });

  it('calendar dates reject impossible days and distinguish leap centuries', () => {
    expect(localDate('2000-02-29')).toBe('2000-02-29');
    expect(yearMonth('2026-11')).toBe('2026-11');
    for (const input of [
      '1900-02-29',
      '2026-02-29',
      '2026-04-31',
      '2026-13-01',
      '0000-01-01',
      '2026-1-01',
      '2026-01-01T00:00:00Z',
    ]) {
      expect(() => localDate(input)).toThrow();
    }
    expect(() => yearMonth('2026-01-01')).toThrow();
  });

  it('monthly bill dates clamp within the month without drifting after February', () => {
    expect(monthlyBillDate(yearMonth('2026-02'), 31)).toBe('2026-02-28');
    expect(monthlyBillDate(yearMonth('2028-02'), 31)).toBe('2028-02-29');
    expect(monthlyBillDate(yearMonth('2026-03'), 31)).toBe('2026-03-31');
    for (const day of [0, 32, 1.5]) {
      expect(() => monthlyBillDate(yearMonth('2026-11'), day)).toThrow();
    }
  });

  it('owner/editor/viewer policy respects membership revocation', () => {
    for (const role of ['owner', 'editor', 'viewer'] as const) {
      const member: WorkspaceMembership = {
        ...metadata,
        id: entityId('membership'),
        userId: entityId('sam'),
        role,
        status: 'active',
      };
      expect(hasWorkspacePermission(member, 'read')).toBe(true);
      expect(hasWorkspacePermission(member, 'edit-finances')).toBe(
        role !== 'viewer',
      );
      expect(hasWorkspacePermission(member, 'manage-members')).toBe(
        role === 'owner',
      );
      for (const permission of [
        'read',
        'edit-finances',
        'manage-members',
      ] as const) {
        expect(
          hasWorkspacePermission({ ...member, status: 'revoked' }, permission),
        ).toBe(false);
      }
    }
  });

  it('opening balances retain the account currency and allow debt', () => {
    expect(() =>
      validateAccount({ ...eur, openingBalance: money('-100', 'EUR') }),
    ).not.toThrow();
    expect(() =>
      validateAccount({ ...eur, openingBalance: money('1', 'USD') }),
    ).toThrow();
  });

  it('splits sum exactly while archived organization remains valid history', () => {
    expect(() => validateTransaction(expense, references)).not.toThrow();
    expect(() =>
      validateTransaction(expense, {
        ...references,
        categories: [{ ...category, archivedAt: metadata.createdAt }],
      }),
    ).not.toThrow();
    expect(() =>
      validateTransaction(
        { ...expense, allocations: [expense.allocations[0]] },
        references,
      ),
    ).toThrow(/sum exactly/);
    expect(() =>
      validateTransaction({ ...expense, allocations: [] }, references),
    ).toThrow();
    expect(() =>
      validateTransaction(
        {
          ...expense,
          allocations: expense.allocations.map((allocation) => ({
            ...allocation,
            key: 'same',
          })),
        },
        references,
      ),
    ).toThrow();
  });

  it('transaction references cannot cross household boundaries', () => {
    for (const field of [
      'accounts',
      'categories',
      'merchants',
      'tags',
    ] as const) {
      const scoped = references[field].map((value) => ({
        ...value,
        workspaceId: entityId('other-home'),
      }));
      expect(() =>
        validateTransaction(expense, { ...references, [field]: scoped }),
      ).toThrow(/another workspace/);
    }
  });

  it('invalid transaction amounts, currencies, categories, and repeated tags fail', () => {
    for (const amount of [
      money('0', 'EUR'),
      money('-1', 'EUR'),
      money('1', 'USD'),
    ]) {
      expect(() =>
        validateTransaction({ ...expense, amount }, references),
      ).toThrow();
    }
    expect(() =>
      validateTransaction(expense, {
        ...references,
        categories: [{ ...category, kind: 'income' }],
      }),
    ).toThrow();
    expect(() =>
      validateTransaction({ ...expense, tagIds: [tag.id, tag.id] }, references),
    ).toThrow();
    expect(() =>
      validateTransaction(expense, { ...references, merchants: [] }),
    ).toThrow();
  });

  it('transfers preserve two currencies and enforce atomic same-currency balance', () => {
    expect(() => validateTransaction(transfer, references)).not.toThrow();
    expect(() =>
      validateTransaction({ ...transfer, credit: transfer.debit }, references),
    ).toThrow(/distinct accounts/);
    const second = { ...eur, id: entityId('second-eur') };
    const sameCurrency = {
      ...transfer,
      credit: { accountId: second.id, amount: money('10', 'EUR') },
    };
    expect(() =>
      validateTransaction(sameCurrency, {
        ...references,
        accounts: [eur, second],
      }),
    ).not.toThrow();
    expect(() =>
      validateTransaction(
        {
          ...sameCurrency,
          credit: { ...sameCurrency.credit, amount: money('9', 'EUR') },
        },
        { ...references, accounts: [eur, second] },
      ),
    ).toThrow(/must balance/);
  });

  it('linked refunds require the original expense in the same workspace and currency', () => {
    const refund: Refund = {
      ...expense,
      id: entityId('refund'),
      kind: 'refund',
      refundOf: expense.id,
    };
    expect(() =>
      validateTransaction(refund, { ...references, refundedExpense: expense }),
    ).not.toThrow();
    expect(() => validateTransaction(refund, references)).toThrow();
    expect(() =>
      validateTransaction(refund, {
        ...references,
        refundedExpense: { ...expense, workspaceId: entityId('other') },
      }),
    ).toThrow();
    expect(() =>
      validateTransaction(refund, {
        ...references,
        refundedExpense: { ...expense, amount: money('1', 'USD') },
      }),
    ).toThrow();
  });

  const budget: WorkspaceBudget = {
    ...metadata,
    id: entityId('budget'),
    name: 'November',
    month: yearMonth('2026-11'),
    limit: money('100', 'EUR'),
    lines: [
      {
        id: entityId('line'),
        categoryId: category.id,
        limit: money('60', 'EUR'),
      },
    ],
    archivedAt: null,
  };

  it('budgets reject mismatched currencies, duplicated categories, and excess allocation', () => {
    expect(() => validateBudget(budget, [category])).not.toThrow();
    expect(() =>
      validateBudget({ ...budget, limit: money('50', 'EUR') }, [category]),
    ).toThrow();
    expect(() =>
      validateBudget({ ...budget, limit: money('100', 'USD') }, [category]),
    ).toThrow();
    expect(() =>
      validateBudget(
        {
          ...budget,
          lines: [
            budget.lines[0],
            { ...budget.lines[0], id: entityId('second-line') },
          ],
        },
        [category],
      ),
    ).toThrow();
    expect(() =>
      validateBudget(budget, [{ ...category, workspaceId: entityId('other') }]),
    ).toThrow();
  });

  it('yearly goal targets require positive money and a calendar year', () => {
    const goal: WorkspaceGoal = {
      ...metadata,
      id: entityId('goal'),
      name: 'Getaway',
      year: 2026,
      target: money('1000', 'EUR'),
      archivedAt: null,
    };
    expect(() => validateGoal(goal)).not.toThrow();
    expect(() => validateGoal({ ...goal, year: 2026.5 })).toThrow();
    expect(() =>
      validateGoal({ ...goal, target: money('0', 'EUR') }),
    ).toThrow();
  });

  it('spending excludes transfers, income, pending and voided entries; refunds reduce it', () => {
    const refund: Refund = {
      ...expense,
      id: entityId('refund'),
      kind: 'refund',
      refundOf: expense.id,
      amount: money('0.1', 'EUR'),
    };
    const usdExpense: Expense = {
      ...expense,
      id: entityId('usd-expense'),
      accountId: usd.id,
      amount: money('2', 'USD'),
    };
    const entries = [
      expense,
      refund,
      transfer,
      usdExpense,
      { ...expense, id: entityId('pending'), status: 'pending' as const },
      { ...expense, id: entityId('voided'), voidedAt: metadata.createdAt },
      { ...expense, id: entityId('income'), kind: 'income' as const },
    ];
    expect(spendingByCurrency(metadata.workspaceId, entries)).toEqual([
      money('0.2', 'EUR'),
      money('2', 'USD'),
    ]);
    expect(spendingByCurrency(metadata.workspaceId, [])).toEqual([]);
    expect(() =>
      spendingByCurrency(metadata.workspaceId, [expense, expense]),
    ).toThrow(/only once/);
  });

  it('spending summaries cannot combine different households', () => {
    expect(() =>
      spendingByCurrency(metadata.workspaceId, [
        { ...expense, workspaceId: entityId('other') },
      ]),
    ).toThrow(/mix workspaces/);
  });

  it('permission policy denies unrecognized roles or capabilities', () => {
    const member: WorkspaceMembership = {
      ...metadata,
      id: entityId('membership'),
      userId: entityId('sam'),
      role: 'owner',
      status: 'active',
    };
    expect(
      hasWorkspacePermission(member, 'delete-everything' as unknown as 'read'),
    ).toBe(false);
    expect(
      hasWorkspacePermission(
        { ...member, role: 'unknown' as unknown as 'owner' },
        'read',
      ),
    ).toBe(false);
  });
});
