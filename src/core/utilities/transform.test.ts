import { assertEqual, assertRejects, assertThrows, test } from '@dephub/assert';

import { string } from '#/core/primitives/string/string.ts';

import { transform } from './schema.ts';

await test('transform', async () => {
  const Upper = transform(string(), (s) => s.toUpperCase());

  // 1. Basic transform
  assertEqual(Upper.parse('hello'), 'HELLO');

  // 2. Throws on invalid input
  assertThrows(() => Upper.parse(123));

  // 3. Async behavior
  assertEqual(await Upper.parseAsync('world'), 'WORLD');

  await assertRejects(() => Upper.parseAsync(123));

  // 4. Sync should throw if transformer returns Promise
  const AsyncTransform = transform(string(), (s) => `${s} Bunny`);

  // 5. Async transformer works in async mode
  assertEqual(await AsyncTransform.parseAsync('hello'), `hello Bunny`);
});
