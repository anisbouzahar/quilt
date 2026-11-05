import type { YearMonth } from '../primitives/calendar';
import { yearMonth } from '../primitives/calendar';
import type { Money } from '../primitives/money';
import {
  addMoney,
  compareMoney,
  isNegativeMoney,
  money,
} from '../primitives/money';
import type {
  EntityId,
  Timestamp,
  WorkspaceRecord,
} from '../primitives/identity';
import type { Category } from '../ledger/catalog';

export interface BudgetLine {
  readonly id: EntityId<'budget-line'>;
  /** Null reserves a limit for uncategorized spending. */
  readonly categoryId: EntityId<'category'> | null;
  readonly limit: Money;
}

/** Initial proposal: calendar-month plans; rollover is not implemented. */
export interface Budget extends WorkspaceRecord<'budget'> {
  readonly name: string;
  readonly month: YearMonth;
  readonly limit: Money;
  readonly lines: readonly BudgetLine[];
  readonly archivedAt: Timestamp | null;
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

export function validateBudget(
  budget: Budget,
  categories: readonly Category[],
): void {
  yearMonth(budget.month);
  requireRule(
    !isNegativeMoney(budget.limit),
    'A budget limit cannot be negative.',
  );
  requireRule(
    new Set(budget.lines.map((line) => line.id)).size === budget.lines.length,
    'Budget line identifiers must be unique.',
  );
  requireRule(
    new Set(budget.lines.map((line) => line.categoryId)).size ===
      budget.lines.length,
    'A budget cannot repeat a category.',
  );
  let allocated = money('0', budget.limit.currency);
  for (const line of budget.lines) {
    requireRule(
      !isNegativeMoney(line.limit),
      'A category limit cannot be negative.',
    );
    allocated = addMoney(allocated, line.limit);
    if (line.categoryId !== null) {
      const category = categories.find(
        (candidate) => candidate.id === line.categoryId,
      );
      requireRule(!!category, 'The budget category does not exist.');
      requireScope(category.workspaceId, budget.workspaceId);
      requireRule(
        category.kind === 'expense',
        'A spending budget uses expense categories.',
      );
    }
  }
  requireRule(
    compareMoney(allocated, budget.limit) <= 0,
    'Category limits cannot exceed the overall budget.',
  );
}
