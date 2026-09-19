# nestjs-oib-validator

A `class-validator` decorator for validating the Croatian **OIB** (_osobni identifikacijski broj_) in NestJS DTOs.

```ts
class CreateCompanyDto {
  @IsOIB()
  oib: string;
}
```

## Installation

```bash
npm install nestjs-oib-validator class-validator
```

`class-validator` is a peer dependency — bring your own version (>= 0.14).

## Usage

### In a NestJS DTO

The decorator plugs into Nest's `ValidationPipe` like any other `class-validator` rule.

```ts
// create-company.dto.ts
import { IsString } from 'class-validator';
import { IsOIB } from 'nestjs-oib-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOIB()
  oib: string;
}
```

```ts
// main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

An invalid OIB then yields a `400 Bad Request`:

```json
{
  "statusCode": 400,
  "message": ["oib must be a valid OIB"],
  "error": "Bad Request"
}
```

### Custom message

```ts
@IsOIB({ message: 'OIB nije ispravan' })
oib: string;
```

Every `ValidationOptions` field is supported (`message`, `groups`, `each`, `always`, `context`).

### Optional fields

Combine with `@IsOptional()` when the field may be absent:

```ts
@IsOptional()
@IsOIB()
oib?: string;
```

### Outside a DTO

The underlying check is exported on its own, for services, guards or scripts:

```ts
import { isValidOib } from 'nestjs-oib-validator';

if (!isValidOib(input)) {
  throw new BadRequestException('Invalid OIB');
}
```

## API

| Export            | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `IsOIB(options?)` | Property decorator; takes the standard `ValidationOptions`.                  |
| `isValidOib(oib)` | `(oib: unknown) => boolean` — the check itself, with no decorator wrapping.   |

Validation errors appear under the `isOIB` key in `ValidationError.constraints`.

### Validation rules

A value passes only if it is a string of exactly 11 digits (`/^[0-9]{11}$/`) whose
final digit is the correct ISO 7064 MOD 11,10 check digit. No normalisation is
performed — surrounding whitespace, separators and a leading `+` all fail. Trim and
strip formatting upstream if your input needs it.

### Fail-safe behaviour

`isValidOib` is total: it takes `unknown` and returns `false` for anything that is
not a valid OIB, including `null`, `undefined`, numbers, objects and values whose
`toString` throws. It never throws, so it is safe to call directly on unvalidated
input without a surrounding type check or `try`/`catch`:

```ts
if (!isValidOib(req.body?.oib)) {
  throw new BadRequestException('Invalid OIB');
}
```

The matching is ASCII-only and anchored, so non-ASCII digit forms (Arabic-Indic,
full-width) are rejected and there is no super-linear input handling.

## Development

```bash
npm test           # jest, rooted at src/
npm run test:cov   # with coverage
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --fix       (lint:check   = no --fix, used by CI)
npm run format     # prettier --write   (format:check = no --write, used by CI)
npm run build      # tsc -> dist/ (js + .d.ts + maps)
```

`prepublishOnly` runs lint, typecheck, tests and the build, so a broken tree
cannot be published.

## License

MIT
