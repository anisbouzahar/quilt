import type { LocalDate } from '../primitives/calendar';
import { localDate } from '../primitives/calendar';
import type { Money } from '../primitives/money';
import { isPositiveMoney } from '../primitives/money';
import type { EntityId, Timestamp, WorkspaceRecord } from '../primitives/identity';

export interface Goal extends WorkspaceRecord<'goal'> {
  readonly name: string;
  readonly year?: number;
  readonly startsOn?: LocalDate;
  readonly targetOn?: LocalDate | null;
  readonly progressMode?: 'tracked';
  readonly target: Money;
  readonly archivedAt: Timestamp | null;
}

/** Planning progress only. Linking an existing transaction does not create another. */
export interface GoalContribution extends WorkspaceRecord<'goal-contribution'> {
  readonly goalId: EntityId<'goal'>;
  readonly kind: 'contribution' | 'withdrawal';
  readonly amount: Money;
  readonly occurredOn: LocalDate;
  readonly transactionId: EntityId<'transaction'> | null;
}

function requireRule(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function validateGoal(goal: Goal): void {
  if (typeof goal.year === 'number') {
    requireRule(
      Number.isInteger(goal.year) && goal.year >= 1900 && goal.year <= 2100,
      'A goal needs an integer calendar year.',
    );
  } else if (goal.startsOn) {
    localDate(goal.startsOn);
    if (goal.targetOn !== null && goal.targetOn !== undefined) {
      localDate(goal.targetOn);
      requireRule(goal.targetOn >= goal.startsOn, 'Invalid deadline.');
    }
    requireRule(goal.progressMode === 'tracked', 'Only tracked goals supported.');
  }
  requireRule(isPositiveMoney(goal.target), 'Positive target required.');
}
