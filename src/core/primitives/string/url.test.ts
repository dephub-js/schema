import { assertEqual, test } from '@dephub/assert';

import { httpUrl, url } from './url.ts';

await test('URLSchema', async () => {
  const data = 'https://example.com/path?query=1';
  const URLSchema = url();

  assertEqual(URLSchema.kind, 'URLSchema');
  assertEqual(URLSchema.type, 'string');

  assertEqual(URLSchema.parse(data), data);
  assertEqual(await URLSchema.parseAsync(data), data);
  assertEqual(URLSchema.clone().clone().safeParse('').error?.issues.length, 1);
});

await test('URLSchema normalization', () => {
  const schema = httpUrl(true);
  const input = '  https://EXAMPLE.com/path  ';
  const expected = 'https://example.com/path';

  assertEqual(schema.parse(input), expected);
});

await test('URLSchema constraints', () => {
  const hostSchema = url({ hostname: /google\.com$/ });
  assertEqual(
    hostSchema.parse('https://www.google.com'),
    'https://www.google.com',
  );

  const protocolSchema = url({ protocol: /^ftp$/ });
  assertEqual(
    protocolSchema.parse('ftp://files.example.com'),
    'ftp://files.example.com',
  );
});
