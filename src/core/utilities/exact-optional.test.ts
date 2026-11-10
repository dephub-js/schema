import { assertEqual, assertRejects, assertThrows, test } from '@dephub/assert';

import { string } from '#/core/primitives/string/string.ts';

import { exactOptional } from './schema.ts';

await test('exactOptional', async () => {
  const Exact = exactOptional(string());

  // 1. Parses valid value
  assertEqual(Exact.parse('hello'), 'hello');

  // 2. Does NOT allow undefined (unlike optional)
  assertThrows(() => Exact.parse(undefined));

  // 3. Throws on invalid input
  assertThrows(() => Exact.parse(123));

  // 4. Async behavior
  assertEqual(await Exact.parseAsync('world'), 'world');

  await assertRejects(() => Exact.parseAsync(undefined));
  await assertRejects(() => Exact.parseAsync(123));
});
