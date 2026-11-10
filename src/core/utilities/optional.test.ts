import { assertEqual, assertRejects, assertThrows, test } from '@dephub/assert';

import { string } from '#/core/primitives/string/string.ts';

import { optional } from './schema.ts';

await test('optional', async () => {
  const OptionalString = optional(string());

  // 1. Accepts undefined
  assertEqual(OptionalString.parse(undefined), undefined);

  // 2. Parses valid value
  assertEqual(OptionalString.parse('hello'), 'hello');

  // 3. Throws on invalid input
  assertThrows(() => OptionalString.parse(123));

  // 4. Async behavior
  assertEqual(await OptionalString.parseAsync(undefined), undefined);
  assertEqual(await OptionalString.parseAsync('world'), 'world');

  await assertRejects(() => OptionalString.parseAsync(123));

  // 5. Null should NOT be accepted
  assertThrows(() => OptionalString.parse(null));
});
