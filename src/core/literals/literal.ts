import type {
  InternalLiteralDef,
  Literal,
  LiteralDef,
  SchemaKind,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { format } from '#internal/utils/format.ts';
import { escapeRegex } from '#internal/utils/regex.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PATTERN,
} from '#internal/utils/symbols.ts';

/** Schema for validating a single literal value. */
export class LiteralSchema<T extends Literal = Literal> extends Schema<T> {
  declare [DEF_TYPE]: InternalLiteralDef<T>;
  public override readonly kind: SchemaKind = 'LiteralSchema';

  constructor(def: LiteralDef<T>) {
    const values = new Set([def.literaldata] as Array<PropertyKey>);
    super({ ...def, values });
  }

  override [SCHEMA_PARSE](data: unknown): T {
    const { literaldata, message } = this[SCHEMA_DEF];

    return this[SCHEMA_ASSERT](Object.is(data, literaldata), {
      code: 'invalid_value',
      expected: literaldata,
      message:
        message ??
        `Invalid input: expected "${format(
          literaldata,
          true,
        )}", received ${format(data, true)}`,
      received: data,
    });
  }

  override [SCHEMA_PATTERN](): RegExp {
    const { values } = this[SCHEMA_DEF];

    const escapedPatterns = [...(values ?? [])].map((o) => {
      if (typeof o === 'string') return escapeRegex(o);
      if (o) return escapeRegex(o.toString());
      return String(o);
    });

    return new RegExp(`^(${escapedPatterns.join('|')})$`);
  }
}

/**
 * Creates a literal schema for the provided value.
 *
 * @param literaldata - The literal value to validate.
 * @param message - Optional error message.
 * @returns Literal schema.
 *
 * @example
 * const schema = s.literal('hello');
 */
export function literal<T extends Literal>(literaldata: T): LiteralSchema<T>;
export function literal<T extends Literal>(
  literaldata: T,
  message?: string,
): LiteralSchema<T>;
export function literal<T extends Literal>(
  literaldata: T,
  message?: string,
): LiteralSchema<T> {
  return new LiteralSchema<T>({ literaldata, message, type: 'literal' });
}
