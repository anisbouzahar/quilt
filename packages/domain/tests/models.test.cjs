const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
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
} = require('../dist');

const metadata = {
  version: 1,
  createdAt: '2026-11-05T12:00:00Z',
  updatedAt: '2026-11-05T12:00:00Z',
  createdBy: entityId('alex'),
  updatedBy: entityId('alex'),
  workspaceId: entityId('home'),
};
const eur = {
  ...metadata,
  id: entityId('eur-account'),
  name: 'Shared bank',
  kind: 'bank',
  currency: 'EUR',
  openingBalance: money('0', 'EUR'),
  openingBalanceDate: localDate('2026-01-01'),
  archivedAt: null,
};
const usd = {
  ...eur,
  id: entityId('usd-account'),
  currency: 'USD',
  openingBalance: money('0', 'USD'),
};
const category = {
  ...metadata,
  id: entityId('groceries'),
  name: 'Groceries',
  kind: 'expense',
  archivedAt: null,
};
const merchant = {
  ...metadata,
  id: entityId('shop'),
  name: 'Shop',
  aliases: [],
  archivedAt: null,
};
const tag = {
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
const expense = {
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
const transfer = {
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

test('identifiers reject empty or whitespace-bearing values', () => {
  for (const input of ['', ' ', 'two ids', ' padded'])
    assert.throws(() => entityId(input));
});
test('calendar dates reject impossible days and distinguish leap centuries', () => {
  assert.equal(localDate('2000-02-29'), '2000-02-29');
  assert.equal(yearMonth('2026-11'), '2026-11');
  for (const input of [
    '1900-02-29',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '0000-01-01',
    '2026-1-01',
    '2026-01-01T00:00:00Z',
  ])
    assert.throws(() => localDate(input));
  assert.throws(() => yearMonth('2026-01-01'));
});
test('monthly bill dates clamp within the month without drifting after February', () => {
  assert.equal(monthlyBillDate(yearMonth('2026-02'), 31), '2026-02-28');
  assert.equal(monthlyBillDate(yearMonth('2028-02'), 31), '2028-02-29');
  assert.equal(monthlyBillDate(yearMonth('2026-03'), 31), '2026-03-31');
  for (const day of [0, 32, 1.5])
    assert.throws(() => monthlyBillDate(yearMonth('2026-11'), day));
});
test('owner/editor/viewer policy respects membership revocation', () => {
  for (const role of ['owner', 'editor', 'viewer']) {
    const member = {
      ...metadata,
      id: entityId('membership'),
      userId: entityId('sam'),
      role,
      status: 'active',
    };
    assert.equal(hasWorkspacePermission(member, 'read'), true);
    assert.equal(
      hasWorkspacePermission(member, 'edit-finances'),
      role !== 'viewer',
    );
    assert.equal(
      hasWorkspacePermission(member, 'manage-members'),
      role === 'owner',
    );
    for (const permission of ['read', 'edit-finances', 'manage-members'])
      assert.equal(
        hasWorkspacePermission({ ...member, status: 'revoked' }, permission),
        false,
      );
  }
});
test('opening balances retain the account currency and allow debt', () => {
  validateAccount({ ...eur, openingBalance: money('-100', 'EUR') });
  assert.throws(() =>
    validateAccount({ ...eur, openingBalance: money('1', 'USD') }),
  );
});
test('splits sum exactly while archived organization remains valid history', () => {
  validateTransaction(expense, references);
  validateTransaction(expense, {
    ...references,
    categories: [{ ...category, archivedAt: metadata.createdAt }],
  });
  assert.throws(
    () =>
      validateTransaction(
        { ...expense, allocations: [expense.allocations[0]] },
        references,
      ),
    /sum exactly/,
  );
  assert.throws(() =>
    validateTransaction({ ...expense, allocations: [] }, references),
  );
  assert.throws(() =>
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
  );
});
test('transaction references cannot cross household boundaries', () => {
  for (const field of ['accounts', 'categories', 'merchants', 'tags']) {
    const scoped = references[field].map((value) => ({
      ...value,
      workspaceId: entityId('other-home'),
    }));
    assert.throws(
      () => validateTransaction(expense, { ...references, [field]: scoped }),
      /another workspace/,
    );
  }
});
test('invalid transaction amounts, currencies, categories, and repeated tags fail', () => {
  for (const amount of [
    money('0', 'EUR'),
    money('-1', 'EUR'),
    money('1', 'USD'),
  ])
    assert.throws(() =>
      validateTransaction({ ...expense, amount }, references),
    );
  assert.throws(() =>
    validateTransaction(expense, {
      ...references,
      categories: [{ ...category, kind: 'income' }],
    }),
  );
  assert.throws(() =>
    validateTransaction({ ...expense, tagIds: [tag.id, tag.id] }, references),
  );
  assert.throws(() =>
    validateTransaction(expense, { ...references, merchants: [] }),
  );
});
test('transfers preserve two currencies and enforce atomic same-currency balance', () => {
  validateTransaction(transfer, references);
  assert.throws(
    () =>
      validateTransaction({ ...transfer, credit: transfer.debit }, references),
    /distinct accounts/,
  );
  const second = { ...eur, id: entityId('second-eur') };
  const sameCurrency = {
    ...transfer,
    credit: { accountId: second.id, amount: money('10', 'EUR') },
  };
  validateTransaction(sameCurrency, { ...references, accounts: [eur, second] });
  assert.throws(
    () =>
      validateTransaction(
        {
          ...sameCurrency,
          credit: { ...sameCurrency.credit, amount: money('9', 'EUR') },
        },
        { ...references, accounts: [eur, second] },
      ),
    /must balance/,
  );
});
test('linked refunds require the original expense in the same workspace and currency', () => {
  const refund = {
    ...expense,
    id: entityId('refund'),
    kind: 'refund',
    refundOf: expense.id,
  };
  validateTransaction(refund, { ...references, refundedExpense: expense });
  assert.throws(() => validateTransaction(refund, references));
  assert.throws(() =>
    validateTransaction(refund, {
      ...references,
      refundedExpense: { ...expense, workspaceId: entityId('other') },
    }),
  );
  assert.throws(() =>
    validateTransaction(refund, {
      ...references,
      refundedExpense: { ...expense, amount: money('1', 'USD') },
    }),
  );
});
const budget = {
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
test('budgets reject mismatched currencies, duplicated categories, and excess allocation', () => {
  validateBudget(budget, [category]);
  assert.throws(() =>
    validateBudget({ ...budget, limit: money('50', 'EUR') }, [category]),
  );
  assert.throws(() =>
    validateBudget({ ...budget, limit: money('100', 'USD') }, [category]),
  );
  assert.throws(() =>
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
  );
  assert.throws(() =>
    validateBudget(budget, [{ ...category, workspaceId: entityId('other') }]),
  );
});
test('yearly goal targets require positive money and a calendar year', () => {
  const goal = {
    ...metadata,
    id: entityId('goal'),
    name: 'Getaway',
    year: 2026,
    target: money('1000', 'EUR'),
    archivedAt: null,
  };
  validateGoal(goal);
  assert.throws(() => validateGoal({ ...goal, year: 2026.5 }));
  assert.throws(() => validateGoal({ ...goal, target: money('0', 'EUR') }));
});
test('spending excludes transfers, income, pending and voided entries; refunds reduce it', () => {
  const refund = {
    ...expense,
    id: entityId('refund'),
    kind: 'refund',
    refundOf: expense.id,
    amount: money('0.1', 'EUR'),
  };
  const usdExpense = {
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
    { ...expense, id: entityId('pending'), status: 'pending' },
    { ...expense, id: entityId('voided'), voidedAt: metadata.createdAt },
    { ...expense, id: entityId('income'), kind: 'income' },
  ];
  assert.deepEqual(spendingByCurrency(metadata.workspaceId, entries), [
    money('0.2', 'EUR'),
    money('2', 'USD'),
  ]);
  assert.deepEqual(spendingByCurrency(metadata.workspaceId, []), []);
  assert.throws(
    () => spendingByCurrency(metadata.workspaceId, [expense, expense]),
    /only once/,
  );
});

test('spending summaries cannot combine different households', () => {
  assert.throws(
    () =>
      spendingByCurrency(metadata.workspaceId, [
        { ...expense, workspaceId: entityId('other') },
      ]),
    /mix workspaces/,
  );
});

test('permission policy denies unrecognized roles or capabilities', () => {
  const member = {
    ...metadata,
    id: entityId('membership'),
    userId: entityId('sam'),
    role: 'owner',
    status: 'active',
  };
  assert.equal(hasWorkspacePermission(member, 'delete-everything'), false);
  assert.equal(
    hasWorkspacePermission({ ...member, role: 'unknown' }, 'read'),
    false,
  );
});
