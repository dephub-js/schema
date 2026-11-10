# @dephub/schema 🛡️

> Type-safe, composable schema validation with first-class TypeScript/JavaScript inference, coercion, and async support.

[![NPM version](https://img.shields.io/npm/v/@dephub/schema.svg?style=flat)](https://npmjs.org/package/@dephub/schema)
[![ESM-only](https://img.shields.io/badge/ESM-only-brightgreen?style=flat)](https://nodejs.org/)

## Features ✨

- 🧩 **Composable schemas** — Primitives, structural types, literals, unions, intersections, pipes, and lazy schemas that snap together.
- 🔒 **Type-safe inference** — Full `Input`/`Output` type inference via `.parse()` and `.parseAsync()`, with `safeParse` for non-throwing validation.
- 🔄 **Powerful coercion** — `s.coerce.string()`, `s.coerce.number()`, `s.coerce.boolean()`, `s.coerce.bigint()`, and `s.coerce.date()` transform loose inputs before validation.
- 🎯 **Rich string & numeric formats** — 30+ built-in formats (email, url, uuid, ipv4/v6, jwt, base64, cuid, ulid, iso dates, int32, uint32, float32/64, int64, uint64, …).
- ⚡ **Async-first** — `parseAsync`, async refinements, async transforms, promise schemas, and async function validation out of the box.
- 🧪 **Transformation pipeline** — Chain `.transform()`, `.overwrite()`, `.pipe()`, `.refine()`, `.check()`, `.default()`, `.prefault()`, `.catch()`, `.readonly()`, `.optional()`, `.nullable()`, and more.

---

## Installation 📦

- npm: `npm install @dephub/schema`
- pnpm: `pnpm add @dephub/schema`
- yarn: `yarn add @dephub/schema`
- bun: `bun add @dephub/schema`

---

## Usage 🎯

### API 🧩

```ts
import { s } from '@dephub/schema';

// Primitives with fluent constraints
const UserSchema = s.object({
  age: s.number().int().min(0).max(120),
  email: s.email(),
  name: s.string().min(2).max(64),
  role: s.enum(['admin', 'user', 'guest']),
});

const user = UserSchema.parse({
  age: 30,
  email: 'ada@example.com',
  name: 'Ada',
  role: 'admin',
});

// Coercion
s.coerce.number().parse('42'); // 42
s.coerce.boolean().parse('true'); // true
s.coerce.date().parse('2024-01-01T00:00:00.000Z'); // Date

// Safe parsing
const result = UserSchema.safeParse({
  age: -1,
  email: 'nope',
  name: 'A',
  role: 'x',
});
if (!result.success) {
  console.error(result.error.issues);
}

// Async parsing
await UserSchema.parseAsync({
  age: 30,
  email: 'ada@example.com',
  name: 'Ada',
  role: 'admin',
});

// Transformations & pipes
const TrimmedUpper = s.string().trim().toUpperCase().pipe(s.string().min(1));

// Unions, intersections, lazies
const ID = s.union([s.uuid(), s.number().int()]);
const Tree = s.lazy(() =>
  s.object({ children: s.array(s.number()), value: s.number() }),
);
```

### Available exports

| Category           | Functions                                                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitives**     | `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`, `nan`, `date`, `file`                                                                                                                                                                                     |
| **Special**        | `any`, `unknown`, `never`, `void`                                                                                                                                                                                                                                                 |
| **String formats** | `email`, `url`, `httpUrl`, `uuid`, `uuidv1`–`uuidv8`, `guid`, `base64`, `base64url`, `jwt`, `ipv4`, `ipv6`, `cidrv4`, `cidrv6`, `cuid`, `cuid2`, `ulid`, `nanoid`, `ksuid`, `xid`, `e164`, `tel`, `emoji`, `stringFormat`, `iso.date`, `iso.datetime`, `iso.duration`, `iso.time` |
| **Number formats** | `int`, `int32`, `uint32`, `float32`, `float64`, `numberFormat`                                                                                                                                                                                                                    |
| **BigInt formats** | `int64`, `uint64`, `bigintFormat`                                                                                                                                                                                                                                                 |
| **Literals**       | `literal`, `enum`, `templateLiteral`                                                                                                                                                                                                                                              |
| **Structural**     | `object`, `array`, `tuple`, `record`, `map`, `set`, `function`, `promise`, `lazy`, `json`, `instanceof`                                                                                                                                                                           |
| **Coercion**       | `coerce.string`, `coerce.number`, `coerce.boolean`, `coerce.bigint`, `coerce.date`                                                                                                                                                                                                |
| **Utilities**      | `optional`, `nullable`, `nonoptional`, `exactOptional`, `default`, `prefault`, `catch`, `pipe`, `transform`, `readonly`, `custom`, `intersection`, `union`, `success`                                                                                                             |
| **Errors**         | `SchemaError`                                                                                                                                                                                                                                                                     |

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
