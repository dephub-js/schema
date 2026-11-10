import { assertEqual, test } from '@dephub/assert';

import { SCHEMA_PATTERN } from '#internal/utils/symbols.ts';

import { enum as enumSchema } from './enum.ts';

await test('EnumSchema (Array)', async () => {
  const colors = ['red', 'blue', 'green'] as const;
  const ColorSchema = enumSchema(colors);

  assertEqual(ColorSchema.kind, 'EnumSchema');
  assertEqual(ColorSchema.type, 'enum');

  assertEqual(ColorSchema.parse('red'), 'red');
  assertEqual(await ColorSchema.parseAsync('blue'), 'blue');

  const pattern = ColorSchema[SCHEMA_PATTERN]();
  assertEqual(pattern.source, '^(red|blue|green)$');
});

// SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
// await test('EnumSchema (Object)', () => {
//   enum Direction {
//     Down = 'DOWN',
//     Up = 'UP',
//   }
//   const DirectionSchema = enumSchema(Direction);

//   assertEqual(DirectionSchema.parse('UP'), Direction.Up);
//   assertEqual(DirectionSchema.parse('DOWN'), Direction.Down);
// });

await test('EnumSchema (Numeric)', () => {
  const numericEnum = {
    Active: 1,
    Inactive: 0,
  } as const;
  const StatusSchema = enumSchema(numericEnum);

  assertEqual(StatusSchema.parse(1), 1);
  assertEqual(StatusSchema.parse(0), 0);
});
