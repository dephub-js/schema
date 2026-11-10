import { assertEqual, test } from '@dephub/assert';

import { unknown } from './unknown.ts';

await test('UnknownSchema', async () => {
  const UnknownSchema = unknown();

  assertEqual(UnknownSchema.kind, 'UnknownSchema');
  assertEqual(UnknownSchema.type, 'unknown');

  const values = [
    'hello',
    42,
    { a: 1 },
    [1, 2, 3],
    true,
    null,
    undefined,
    Symbol('foo'),
    NaN,
  ];

  for (const value of values) {
    assertEqual(UnknownSchema.parse(value), value);
    assertEqual(await UnknownSchema.parseAsync(value), value);
  }
});
