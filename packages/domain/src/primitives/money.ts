declare const currencyBrand: unique symbol;
declare const decimalBrand: unique symbol;
export type CurrencyCode = string & { readonly [currencyBrand]: true };
export type DecimalAmount = string & { readonly [decimalBrand]: true };

/** JSON-safe exact decimal; sign is meaningful, so transactions validate positivity. */
export interface Money {
  readonly amount: DecimalAmount;
  readonly currency: CurrencyCode;
}

/** Syntax only. The application must separately configure supported currencies. */
export function currencyCode(value: string): CurrencyCode {
  if (!/^[A-Z]{3}$/.test(value))
    throw new Error('Use a three-letter uppercase currency code.');
  return value as CurrencyCode;
}

export function decimalAmount(value: string): DecimalAmount {
  if (!/^-?(0|[1-9]\d*)(\.\d+)?$/.test(value)) {
    throw new Error(
      'Use an exact decimal string without exponents or separators.',
    );
  }
  const normalized = value.includes('.')
    ? value.replace(/0+$/, '').replace(/\.$/, '')
    : value;
  return (normalized === '-0' ? '0' : normalized) as DecimalAmount;
}

export function money(amount: string, currency: string): Money {
  return { amount: decimalAmount(amount), currency: currencyCode(currency) };
}

function parts(amount: DecimalAmount) {
  const [whole = '0', fraction = ''] = amount.split('.');
  return { units: BigInt(whole + fraction), scale: fraction.length };
}

function power(scale: number) {
  return 10n ** BigInt(scale);
}

function format(units: bigint, scale: number): DecimalAmount {
  const negative = units < 0n;
  const digits = (negative ? -units : units)
    .toString()
    .padStart(scale + 1, '0');
  const value =
    scale === 0 ? digits : `${digits.slice(0, -scale)}.${digits.slice(-scale)}`;
  return decimalAmount(`${negative ? '-' : ''}${value}`);
}

function align(left: Money, right: Money) {
  if (left.currency !== right.currency)
    throw new Error('Convert currencies explicitly before combining money.');
  const a = parts(left.amount);
  const b = parts(right.amount);
  const scale = Math.max(a.scale, b.scale);
  return {
    a: a.units * power(scale - a.scale),
    b: b.units * power(scale - b.scale),
    scale,
  };
}
export function addMoney(left: Money, right: Money): Money {
  const { a, b, scale } = align(left, right);
  return { amount: format(a + b, scale), currency: left.currency };
}
export function subtractMoney(left: Money, right: Money): Money {
  const { a, b, scale } = align(left, right);
  return { amount: format(a - b, scale), currency: left.currency };
}
export function compareMoney(left: Money, right: Money): -1 | 0 | 1 {
  const { a, b } = align(left, right);
  return a < b ? -1 : a > b ? 1 : 0;
}
export function isPositiveMoney(value: Money): boolean {
  return parts(value.amount).units > 0n;
}
export function isNegativeMoney(value: Money): boolean {
  return parts(value.amount).units < 0n;
}

export type RoundingMode = 'half-even' | 'half-away-from-zero' | 'toward-zero';
function validateScale(fractionDigits: number) {
  if (
    !Number.isInteger(fractionDigits) ||
    fractionDigits < 0 ||
    fractionDigits > 18
  ) {
    throw new Error('Currency precision must be an integer between 0 and 18.');
  }
}
function rounded(
  units: bigint,
  scale: number,
  fractionDigits: number,
  mode: RoundingMode,
) {
  validateScale(fractionDigits);
  if (!['half-even', 'half-away-from-zero', 'toward-zero'].includes(mode))
    throw new Error('Choose an explicit supported rounding mode.');
  if (scale <= fractionDigits) return format(units, scale);
  const divisor = power(scale - fractionDigits);
  const quotient = units / divisor;
  const remainder = units < 0n ? -(units % divisor) : units % divisor;
  const tie = remainder * 2n === divisor;
  const increment =
    mode !== 'toward-zero' &&
    (remainder * 2n > divisor ||
      (tie && (mode === 'half-away-from-zero' || quotient % 2n !== 0n)));
  return format(
    quotient + (increment ? (units < 0n ? -1n : 1n) : 0n),
    fractionDigits,
  );
}
/** Callers choose currency precision and rounding explicitly; no global FX policy. */
export function roundMoney(
  value: Money,
  fractionDigits: number,
  mode: RoundingMode,
): Money {
  const { units, scale } = parts(value.amount);
  return {
    amount: rounded(units, scale, fractionDigits, mode),
    currency: value.currency,
  };
}

export interface ConversionQuote {
  readonly baseCurrency: CurrencyCode;
  readonly quoteCurrency: CurrencyCode;
  /** Quote-currency units for one base-currency unit; must be positive. */
  readonly rate: DecimalAmount;
  readonly asOf: string;
  readonly retrievedAt: string;
  readonly source: string;
}
/** The result keeps its quote; callers retain the original amount as well. */
export interface ConvertedMoney {
  readonly original: Money;
  readonly converted: Money;
  readonly quote: ConversionQuote;
  readonly fractionDigits: number;
  readonly rounding: RoundingMode;
}
export function convertMoney(
  original: Money,
  quote: ConversionQuote,
  fractionDigits: number,
  rounding: RoundingMode,
): ConvertedMoney {
  if (original.currency !== quote.baseCurrency)
    throw new Error(
      'The conversion quote does not match the original currency.',
    );
  const rate = parts(decimalAmount(quote.rate));
  if (
    rate.units <= 0n ||
    !quote.source.trim() ||
    !quote.asOf ||
    !quote.retrievedAt
  )
    throw new Error('A positive rate and conversion provenance are required.');
  const value = parts(original.amount);
  return {
    original,
    converted: {
      amount: rounded(
        value.units * rate.units,
        value.scale + rate.scale,
        fractionDigits,
        rounding,
      ),
      currency: quote.quoteCurrency,
    },
    quote,
    fractionDigits,
    rounding,
  };
}

