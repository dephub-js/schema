import { assertEqual, test } from '@dephub/assert';

import { string } from '#/core/primitives/string/string.ts';

import { success } from './success.ts';

await test('SuccessSchema', async () => {
  const SuccessSchema = success(string());
  const data = 'Bunny';

  assertEqual(SuccessSchema.kind, 'SuccessSchema');
  assertEqual(SuccessSchema.type, 'success');

  assertEqual(SuccessSchema.parse(data), true);
  assertEqual(await SuccessSchema.parseAsync(data), true);

  assertEqual(SuccessSchema.safeParse(data).success, true);
  assertEqual((await SuccessSchema.safeParseAsync(data)).success, true);
});
