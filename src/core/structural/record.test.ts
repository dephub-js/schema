import { assertEqual, assertThrows, test } from '@dephub/assert';

import { number } from '#/core/primitives/number/number.ts';
import { string } from '#/core/primitives/string/string.ts';
import { custom } from '#/core/utilities/custom.ts';

import { record } from './record.ts';

await test('RecordSchema', async () => {
  const KeySchema = string();
  const ValueSchema = number();
  const RecordSchema = record(KeySchema, ValueSchema);

  assertEqual(RecordSchema.kind, 'RecordSchema');
  assertEqual(RecordSchema.type, 'record');

  // 1. Validates basic Record objects
  const validData = { a: 1, b: 2 };
  const result = RecordSchema.parse(validData);
  assertEqual(result.a, 1);
  assertEqual(result.b, 2);

  // 2. Validates Record objects asynchronously
  const asyncResult = await RecordSchema.parseAsync(validData);
  assertEqual(asyncResult.a, 1);

  // 3. Numeric Key Coercion
  // The implementation attempts to parse numeric strings as Numbers if the keyType fails initial string parse
  const NumericKeySchema = record(number(), string());
  const numericData = { '123': 'value' };
  const coercedResult = NumericKeySchema.parse(numericData);

  // Verify the key was coerced to a number in the output
  assertEqual(coercedResult[123], 'value');

  // 4. Throws on invalid Value types
  assertThrows(() => RecordSchema.parse({ a: 'not-a-number' }));

  // 5. Throws on invalid Key types (where coercion isn't possible or fails)
  // If we expect numbers but get a non-numeric string
  assertThrows(() => NumericKeySchema.parse({ abc: 'value' }));

  // 6. Security: Should skip __proto__
  const protoData = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}');
  const protoResult = RecordSchema.parse(protoData);
  assertEqual(protoResult.a, 1);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  assertEqual('polluted' in protoResult['__proto__'], false);

  // 7. Handles Symbol keys (if the key schema supports them)
  const sym = Symbol('key');
  const RecordWithSymbol = record(
    string().or(custom<symbol>((val) => typeof val === 'symbol')),
    number(),
  );
  const symData = { normal: 1, [sym]: 100 };
  const symResult = RecordWithSymbol.parse(symData);
  assertEqual(symResult[sym], 100);

  // 8. Should throw on non-record types
  assertThrows(() => RecordSchema.parse(null));
  assertThrows(() => RecordSchema.parse([]));
  assertThrows(() => RecordSchema.parse(123));
});
