import { assertEqual, assertThrows, test } from '@dephub/assert';

import { symbol } from './symbol.ts';

await test('SymbolSchema', async () => {
  const data = Symbol('test');
  const SymbolSchema = symbol();

  assertEqual(SymbolSchema.kind, 'SymbolSchema');

  assertEqual(SymbolSchema.parse(data), data);
  assertEqual(
    SymbolSchema.parse(Symbol.for('registry')),
    Symbol.for('registry'),
  );
  assertEqual(await SymbolSchema.parseAsync(data), data);

  assertThrows(() => SymbolSchema.parse('symbol'));
  assertThrows(() => SymbolSchema.parse(123));
  assertThrows(() => SymbolSchema.parse(null));
  assertThrows(() => SymbolSchema.parse({}));
  assertThrows(() => SymbolSchema.parse(undefined));
});
