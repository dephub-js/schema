import { assertEqual, assertRejects, assertThrows, test } from '@dephub/assert';

import { string } from '#/core/primitives/string/string.ts';

import { union } from './schema.ts';

await test('union', async () => {
  const UnionString = union([string(), string()]);

  // 1. Accepts valid value
  assertEqual(UnionString.parse('hello'), 'hello');

  // 2. Throws when all options fail
  assertThrows(() => UnionString.parse(123));

  // 3. Async behavior
  assertEqual(await UnionString.parseAsync('world'), 'world');

  await assertRejects(() => UnionString.parseAsync(123));

  // 4. Returns first successful match
  const FirstMatch = union([
    string().transform((s) => s.toUpperCase()),
    string().transform((s) => `x-${s}`),
  ]);

  assertEqual(FirstMatch.parse('a'), 'A');
});
