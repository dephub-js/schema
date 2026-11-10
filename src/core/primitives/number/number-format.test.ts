import { assertEqual, test } from '@dephub/assert';

import { numberFormat } from './number-format.ts';

await test('NumberFormatSchema', async () => {
  const data = -2147483648;
  const NumberFormatSchema = numberFormat('int32');

  assertEqual(NumberFormatSchema.kind, 'NumberSchema');
  assertEqual(NumberFormatSchema.type, 'number');

  assertEqual(NumberFormatSchema.parse(data), data);
  assertEqual(await NumberFormatSchema.parseAsync(data), data);

  assertEqual(
    NumberFormatSchema.clone().clone().safeParse(2147483648).error?.issues
      .length,
    1,
  );
});
