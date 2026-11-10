import { assertEqual, test } from '@dephub/assert';

import { stringFormat } from './string-format.ts';

await test('StringFormatSchema', async () => {
  const data = '😂';
  const regex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
  const StringFormatSchema = stringFormat('emoji', new RegExp(regex, 'u'));

  assertEqual(StringFormatSchema.kind, 'StringSchema');
  assertEqual(StringFormatSchema.type, 'string');

  assertEqual(StringFormatSchema.parse(data), data);
  assertEqual(await StringFormatSchema.parseAsync(data), data);

  assertEqual(
    StringFormatSchema.clone().clone().safeParse('').error?.issues.length,
    1,
  );
});
