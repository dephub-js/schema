import type {
  DateDef,
  InternalDateDef,
  SchemaKind,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isDate } from '#internal/is/date.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
} from '#internal/utils/symbols.ts';

/**
 * Schema for validating Date objects.
 */
export class DateSchema extends Schema<Date> {
  declare [DEF_TYPE]: InternalDateDef;
  public override readonly kind: SchemaKind = 'DateSchema';

  constructor(def: DateDef) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): Date {
    let input = data;

    if (this[SCHEMA_DEF].coerce) {
      try {
        input = new Date(input as any);
      } catch {
        //
      }
    }

    return this[SCHEMA_ASSERT](isDate(input), {
      output: input,
      received: data,
    });
  }
}

/**
 * Creates a date schema.
 *
 * @param message - Optional error message.
 * @returns Date schema.
 *
 * @example
 * const schema = s.date();
 *
 * @example
 * const schema = s.date('Invalid date');
 */
export function date(): DateSchema;
export function date(message?: string): DateSchema;
export function date(message?: string): DateSchema {
  return new DateSchema({
    message,
    type: 'date',
  });
}
