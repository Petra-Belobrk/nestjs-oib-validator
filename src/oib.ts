import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

const OIB_PATTERN = /^[0-9]{11}$/;

/**
 * Checks whether `value` is a valid Croatian OIB (osobni identifikacijski broj):
 * a string of exactly 11 digits whose last digit is the ISO 7064 MOD 11,10 check
 * digit of the first ten.
 *
 * Total by design — accepts `unknown` and returns `false` for anything that is
 * not a valid OIB, including `null`, `undefined` and non-string values. It never
 * throws, so it is safe to call directly on unvalidated request input.
 *
 * No normalisation is performed: surrounding whitespace, separators and a
 * leading `+` all fail. Trim and strip formatting upstream if needed.
 */
export function isValidOib(oib: unknown): boolean {
  if (typeof oib !== 'string' || !OIB_PATTERN.test(oib)) return false;

  // The pattern above guarantees 11 ASCII digits, so charCodeAt - 48 is safe and
  // lets the checksum run without allocating substrings.
  let remainder = 10;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder + (oib.charCodeAt(i) - 48)) % 10;
    if (remainder === 0) remainder = 10;
    remainder = (remainder * 2) % 11;
  }

  let checkDigit = 11 - remainder;
  if (checkDigit === 10) checkDigit = 0;

  return checkDigit === oib.charCodeAt(10) - 48;
}

/**
 * Property decorator validating the value as a Croatian OIB.
 *
 * Delegates to {@link isValidOib}, so any value that is not a valid OIB — of any
 * type — produces a validation error rather than an exception.
 *
 * @example
 * class CreateCompanyDto {
 *   @IsOIB()
 *   oib: string;
 * }
 */
export function IsOIB(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOIB',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return isValidOib(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid OIB`;
        },
      },
    });
  };
}
