const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  money,
  addMoney,
  subtractMoney,
  compareMoney,
  roundMoney,
  convertMoney,
  decimalAmount,
  currencyCode,
} = require('../dist');

test('decimal arithmetic stays exact beyond Number precision and across scales', () => {
  assert.deepEqual(
    addMoney(money('0.1', 'EUR'), money('0.2', 'EUR')),
    money('0.3', 'EUR'),
  );
  assert.deepEqual(
    addMoney(money('9007199254740993.99', 'EUR'), money('0.01', 'EUR')),
    money('9007199254740994', 'EUR'),
  );
  assert.deepEqual(
    subtractMoney(money('1', 'EUR'), money('1.005', 'EUR')),
    money('-0.005', 'EUR'),
  );
  assert.deepEqual(
    addMoney(money('-0.005', 'EUR'), money('0.01', 'EUR')),
    money('0.005', 'EUR'),
  );
  assert.equal(compareMoney(money('-0.1', 'EUR'), money('-0.01', 'EUR')), -1);
});
test('money is canonical and rejects ambiguous or non-decimal values', () => {
  assert.equal(decimalAmount('1.2300'), '1.23');
  assert.equal(decimalAmount('-0.000'), '0');
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
    assert.throws(() => money(input, 'EUR'));
  }
  for (const code of ['eur', 'EU', 'USDT', '€', ' EUR'])
    assert.throws(() => currencyCode(code));
});
test('currencies cannot silently combine or compare', () => {
  const eur = money('1', 'EUR');
  const usd = money('1', 'USD');
  for (const operation of [addMoney, subtractMoney, compareMoney])
    assert.throws(() => operation(eur, usd), /Convert currencies explicitly/);
});
test('rounding is explicit, symmetric, and supports zero and three decimal currencies', () => {
  const cases = [
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
  for (const [amount, digits, mode, expected] of cases)
    assert.equal(
      roundMoney(money(amount, 'EUR'), digits, mode).amount,
      expected,
    );
  for (const digits of [-1, 1.5, 19])
    assert.throws(() => roundMoney(money('1', 'EUR'), digits, 'half-even'));
  assert.throws(() => roundMoney(money('1', 'EUR'), 2, 'guess'));
});
const quote = {
  baseCurrency: currencyCode('USD'),
  quoteCurrency: currencyCode('EUR'),
  rate: decimalAmount('0.92345'),
  source: 'test-source',
  asOf: '2026-11-05',
  retrievedAt: '2026-11-05T12:00:00Z',
};
test('conversion retains original money, provenance, precision, and rounding', () => {
  const original = money('10', 'USD');
  const result = convertMoney(original, quote, 2, 'half-even');
  assert.deepEqual(result.converted, money('9.23', 'EUR'));
  assert.equal(result.original, original);
  assert.equal(result.quote, quote);
  assert.equal(result.rounding, 'half-even');
  assert.equal(result.fractionDigits, 2);
  assert.deepEqual(
    convertMoney(money('-10', 'USD'), quote, 2, 'half-even').converted,
    money('-9.23', 'EUR'),
  );
});
test('conversion rejects a reversed, nonpositive, or unattributed quote', () => {
  assert.throws(() => convertMoney(money('10', 'EUR'), quote, 2, 'half-even'));
  for (const rate of ['0', '-1'])
    assert.throws(() =>
      convertMoney(money('10', 'USD'), { ...quote, rate }, 2, 'half-even'),
    );
  for (const field of ['source', 'asOf', 'retrievedAt'])
    assert.throws(() =>
      convertMoney(
        money('10', 'USD'),
        { ...quote, [field]: '' },
        2,
        'half-even',
      ),
    );
});
