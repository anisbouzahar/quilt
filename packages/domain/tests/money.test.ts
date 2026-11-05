import { describe, it, expect } from 'vitest';
import {
  money,
  addMoney,
  subtractMoney,
  compareMoney,
  roundMoney,
  convertMoney,
  decimalAmount,
  currencyCode,
  type RoundingMode,
} from '../src';

describe('Domain Money', () => {
  it('decimal arithmetic stays exact beyond Number precision and across scales', () => {
    expect(addMoney(money('0.1', 'EUR'), money('0.2', 'EUR'))).toEqual(
      money('0.3', 'EUR'),
    );
    expect(
      addMoney(money('9007199254740993.99', 'EUR'), money('0.01', 'EUR')),
    ).toEqual(money('9007199254740994', 'EUR'));
    expect(subtractMoney(money('1', 'EUR'), money('1.005', 'EUR'))).toEqual(
      money('-0.005', 'EUR'),
    );
    expect(addMoney(money('-0.005', 'EUR'), money('0.01', 'EUR'))).toEqual(
      money('0.005', 'EUR'),
    );
    expect(compareMoney(money('-0.1', 'EUR'), money('-0.01', 'EUR'))).toBe(-1);
  });

  it('money is canonical and rejects ambiguous or non-decimal values', () => {
    expect(decimalAmount('1.2300')).toBe('1.23');
    expect(decimalAmount('-0.000')).toBe('0');
    for (const input of [
      '1e3',
      'NaN',
      'Infinity',
      '01',
      '.5',
      '1,20',
      ' 1',
      '+1',
      '1.',
      '',
    ]) {
      expect(() => money(input, 'EUR')).toThrow();
    }
    for (const code of ['eur', 'EU', 'USDT', '€', ' EUR']) {
      expect(() => currencyCode(code)).toThrow();
    }
  });

  it('currencies cannot silently combine or compare', () => {
    const eur = money('1', 'EUR');
    const usd = money('1', 'USD');
    for (const operation of [addMoney, subtractMoney, compareMoney]) {
      expect(() => operation(eur, usd)).toThrow(/Convert currencies explicitly/);
    }
  });

  it('rounding is explicit, symmetric, and supports zero and three decimal currencies', () => {
    const cases: Array<[string, number, RoundingMode, string]> = [
      ['1.245', 2, 'half-even', '1.24'],
      ['1.255', 2, 'half-even', '1.26'],
      ['-1.245', 2, 'half-even', '-1.24'],
      ['-1.255', 2, 'half-even', '-1.26'],
      ['-1.245', 2, 'half-away-from-zero', '-1.25'],
      ['-1.999', 2, 'toward-zero', '-1.99'],
      ['999.5', 0, 'half-even', '1000'],
      ['1.2345', 3, 'half-even', '1.234'],
      ['1.2355', 3, 'half-even', '1.236'],
    ];
    for (const [amount, digits, mode, expected] of cases) {
      expect(roundMoney(money(amount, 'EUR'), digits, mode).amount).toBe(
        expected,
      );
    }
    for (const digits of [-1, 1.5, 19]) {
      expect(() => roundMoney(money('1', 'EUR'), digits, 'half-even')).toThrow();
    }
    expect(() =>
      roundMoney(money('1', 'EUR'), 2, 'guess' as unknown as RoundingMode),
    ).toThrow();
  });

  const quote = {
    baseCurrency: currencyCode('USD'),
    quoteCurrency: currencyCode('EUR'),
    rate: decimalAmount('0.92345'),
    source: 'test-source',
    asOf: '2026-11-05',
    retrievedAt: '2026-11-05T12:00:00Z',
  };

  it('conversion retains original money, provenance, precision, and rounding', () => {
    const original = money('10', 'USD');
    const result = convertMoney(original, quote, 2, 'half-even');
    expect(result.converted).toEqual(money('9.23', 'EUR'));
    expect(result.original).toBe(original);
    expect(result.quote).toBe(quote);
    expect(result.rounding).toBe('half-even');
    expect(result.fractionDigits).toBe(2);
    expect(
      convertMoney(money('-10', 'USD'), quote, 2, 'half-even').converted,
    ).toEqual(money('-9.23', 'EUR'));
  });

  it('conversion rejects a reversed, nonpositive, or unattributed quote', () => {
    expect(() => convertMoney(money('10', 'EUR'), quote, 2, 'half-even')).toThrow();
    for (const rate of ['0', '-1']) {
      expect(() =>
        convertMoney(
          money('10', 'USD'),
          { ...quote, rate: rate as unknown as ReturnType<typeof decimalAmount> },
          2,
          'half-even',
        ),
      ).toThrow();
    }
    for (const field of ['source', 'asOf', 'retrievedAt']) {
      expect(() =>
        convertMoney(
          money('10', 'USD'),
          { ...quote, [field]: '' },
          2,
          'half-even',
        ),
      ).toThrow();
    }
  });
});

