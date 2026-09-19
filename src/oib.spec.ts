import { validate } from 'class-validator';

import { IsOIB, isValidOib } from './oib';

// Check digits per ISO 7064, MOD 11,10.
const VALID = [
  '12345678903',
  '00000000001',
  '69435151530',
  '11111111119',
  '21610215487',
  '98765432106',
];

// Same first ten digits as above, but with a wrong check digit.
const WRONG_CHECK_DIGIT = [
  '12345678901',
  '00000000000',
  '69435151531',
  '11111111111',
  '21610215480',
  '98765432109',
];

describe('isValidOib', () => {
  it.each(VALID)('accepts %s', (oib) => {
    expect(isValidOib(oib)).toBe(true);
  });

  it.each(WRONG_CHECK_DIGIT)('rejects %s (bad check digit)', (oib) => {
    expect(isValidOib(oib)).toBe(false);
  });

  it.each([
    ['too short', '1234567890'],
    ['too long', '123456789030'],
    ['empty', ''],
    ['whitespace only', '   '],
    ['trailing whitespace', '12345678903 '],
    ['non-digits', '1234567890a'],
    ['formatted with spaces', '123 456 789 03'],
    ['leading plus', '+12345678903'],
  ])('rejects %s', (_label, oib) => {
    expect(isValidOib(oib)).toBe(false);
  });

  // Total by design: never throws, whatever it is handed.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 12345678903],
    ['a bigint', 12345678903n],
    ['a boolean', true],
    ['an object', {}],
    ['an array', ['12345678903']],
    ['a String wrapper object', new String('12345678903')],
    ['a symbol', Symbol('12345678903')],
    ['a function', () => '12345678903'],
    ['an object with a toString', { toString: () => '12345678903' }],
    [
      'an object with a throwing toString',
      {
        toString: () => {
          throw new Error('boom');
        },
      },
    ],
  ])('rejects %s without throwing', (_label, value) => {
    expect(() => isValidOib(value)).not.toThrow();
    expect(isValidOib(value)).toBe(false);
  });

  it('accepts exactly one check digit for a given ten-digit base', () => {
    const base = '6943515153';
    const accepted = [...Array(10).keys()].filter((d) =>
      isValidOib(`${base}${d}`),
    );

    expect(accepted).toEqual([0]);
  });
});

class CompanyDto {
  @IsOIB()
  oib: unknown;

  constructor(oib: unknown) {
    this.oib = oib;
  }
}

class CompanyWithMessageDto {
  @IsOIB({ message: 'OIB nije ispravan' })
  oib: string;

  constructor(oib: string) {
    this.oib = oib;
  }
}

describe('IsOIB', () => {
  it('reports no errors for a valid OIB', async () => {
    await expect(validate(new CompanyDto('12345678903'))).resolves.toEqual([]);
  });

  it('reports an isOIB error for an invalid OIB', async () => {
    const errors = await validate(new CompanyDto('12345678901'));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('oib');
    expect(errors[0].constraints).toHaveProperty('isOIB');
  });

  it('uses a default message naming the property', async () => {
    const errors = await validate(new CompanyDto('12345678901'));

    expect(errors[0].constraints?.isOIB).toBe('oib must be a valid OIB');
  });

  it('honours a custom message', async () => {
    const errors = await validate(new CompanyWithMessageDto('12345678901'));

    expect(errors[0].constraints?.isOIB).toBe('OIB nije ispravan');
  });

  // The decorator guards the type before delegating, so non-strings are
  // rejected rather than reaching isValidOib.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 12345678903],
    ['an object', {}],
    ['an array', ['12345678903']],
  ])('rejects %s without throwing', async (_label, value) => {
    const errors = await validate(new CompanyDto(value));

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isOIB');
  });
});
