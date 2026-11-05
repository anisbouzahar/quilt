declare const dateBrand: unique symbol;
declare const monthBrand: unique symbol;
export type LocalDate = string & { readonly [dateBrand]: true };
export type YearMonth = string & { readonly [monthBrand]: true };

export function localDate(value: string): LocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('Use a calendar date in YYYY-MM-DD format.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (days[month - 1] ?? 0)
  )
    throw new Error('The calendar date does not exist.');
  return value as LocalDate;
}
export function yearMonth(value: string): YearMonth {
  localDate(`${value}-01`);
  return value as YearMonth;
}

/** A month-end bill is clamped to the last day, never moved into another month. */
export function monthlyBillDate(
  month: YearMonth,
  dayOfMonth: number,
): LocalDate {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31)
    throw new Error('A monthly bill day must be between 1 and 31.');
  for (let day = dayOfMonth; day >= 1; day--) {
    try {
      return localDate(`${month}-${String(day).padStart(2, '0')}`);
    } catch {
      /* Try the preceding calendar day. */
    }
  }
  throw new Error('Invalid bill month.');
}

