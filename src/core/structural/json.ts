import type { JSONSchema } from '#internal/types/index.ts';

import { boolean } from '#/core/primitives/boolean.ts';
import { null as null_ } from '#/core/primitives/null.ts';
import { number } from '#/core/primitives/number/number.ts';
import { string } from '#/core/primitives/string/string.ts';
import { lazy } from '#/core/structural/lazy.ts';
import { record } from '#/core/structural/record.ts';
import { array, union } from '#/core/utilities/schema.ts';

/**
 * Creates a schema for validating JSON-compatible values.
 *
 * @param message - Optional validation message.
 * @returns JSON schema.
 *
 * @example
 * const schema = s.json();
 */
export function json(): JSONSchema;
export function json(message?: string): JSONSchema;
export function json(message?: string): JSONSchema {
  const schema: JSONSchema = lazy(() =>
    union([
      string(message),
      number(),
      boolean(),
      null_(),
      array(schema),
      record(string(), schema),
    ]),
  );

  return schema;
}
