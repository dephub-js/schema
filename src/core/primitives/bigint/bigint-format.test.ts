import { assertEqual, test } from '@dephub/assert';

import { bigintFormat } from './bigint-format.ts';

await test('BigIntFormatSchema', async () => {
  const data = 123n;
  const BigIntFormatSchema = bigintFormat('int64');

  assertEqual(BigIntFormatSchema.kind, 'BigIntSchema');
  assertEqual(BigIntFormatSchema.type, 'bigint');

  assertEqual(BigIntFormatSchema.parse(data), data);
  assertEqual(await BigIntFormatSchema.parseAsync(data), data);

  assertEqual(
    BigIntFormatSchema.clone().clone().safeParse(-9223372036854775809n).error
      ?.issues.length,
    1,
  );
});
