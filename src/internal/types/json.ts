import type { BooleanSchema } from '#/core/primitives/boolean.ts';
import type { NullSchema } from '#/core/primitives/null.ts';
import type { NumberSchema } from '#/core/primitives/number/number.ts';
import type { StringSchema } from '#/core/primitives/string/string.ts';
import type { LazySchema } from '#/core/structural/lazy.ts';
import type { RecordSchema } from '#/core/structural/record.ts';
import type { ArraySchema, UnionSchema } from '#/core/utilities/schema.ts';

export type JSONSchema = LazySchema<
  UnionSchema<
    readonly [
      StringSchema,
      NumberSchema,
      BooleanSchema,
      NullSchema,
      ArraySchema<JSONSchema>,
      RecordSchema<StringSchema, JSONSchema>,
    ]
  >
>;
