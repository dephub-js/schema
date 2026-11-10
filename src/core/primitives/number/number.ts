import type {
  InternalNumberDef,
  NumberDef,
  SchemaKind,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isNumber } from '#internal/is/number.ts';
import { _gt, _gte } from '#internal/utils/greater.ts';
import { _lt, _lte } from '#internal/utils/less.ts';
import { _multipleOf } from '#internal/utils/multiple.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PATTERN,
} from '#internal/utils/symbols.ts';

/** Schema for validating number values. */
export class NumberSchema extends Schema<number> {
  declare [DEF_TYPE]: InternalNumberDef;
  public override readonly kind: SchemaKind = 'NumberSchema';

  constructor(def: NumberDef) {
    super(def);
  }

  /**
   * Sets the minimum value (exclusive).
   *
   * @param value - The value the input must be greater than.
   * @param message - Optional error message.
   * @returns Number schema with the exclusive minimum constraint.
   *
   * @example
   * const schema = s.number().gt(10);
   */
  gt(value: number): this;
  gt(value: number, message?: string): this;
  gt(value: number, message?: string): this {
    return _gt(this, value, message);
  }

  /**
   * Sets the minimum value (inclusive).
   *
   * @param value - The minimum number allowed.
   * @param message - Optional error message.
   * @returns Number schema with the inclusive minimum constraint.
   *
   * @example
   * const schema = s.number().gte(10);
   */
  gte(value: number): this;
  gte(value: number, message?: string): this;
  gte(value: number, message?: string): this {
    return _gte(this, value, message);
  }

  /**
   * Requires the value to be a whole number (no decimals).
   *
   * @param message - Optional error message.
   * @returns Number schema that accepts only integer values.
   *
   * @example
   * const schema = s.number().int();
   */
  int(): this;
  int(message?: string): this;
  int(message?: string): this {
    return this.check((payload) => {
      const input = payload.data;
      if (!Number.isInteger(input)) {
        payload.issues.push({
          code: 'invalid_type',
          expected: 'int',
          format: 'safeint',
          message: message ?? 'Invalid input: expected int, received number',
          received: input,
        });
      }
    });
  }

  /**
   * Sets the maximum value (exclusive).
   *
   * @param value - The value the input must be less than.
   * @param message - Optional error message.
   * @returns Number schema with the exclusive maximum constraint.
   *
   * @example
   * const schema = s.number().lt(100);
   */
  lt(value: number): this;
  lt(value: number, message?: string): this;
  lt(value: number, message?: string): this {
    return _lt(this, value, message);
  }

  /**
   * Sets the maximum value (inclusive).
   *
   * @param value - The maximum number allowed.
   * @param message - Optional error message.
   * @returns Number schema with the inclusive maximum constraint.
   *
   * @example
   * const schema = s.number().lte(100);
   */
  lte(value: number): this;
  lte(value: number, message?: string): this;
  lte(value: number, message?: string): this {
    return _lte(this, value, message);
  }

  /**
   * Sets the maximum value (inclusive). Alias for lte.
   *
   * @param value - The maximum number allowed.
   * @param message - Optional error message.
   * @returns Number schema with the maximum value constraint.
   *
   * @example
   * const schema = s.number().max(100);
   */
  max(value: number): this;
  max(value: number, message?: string): this;
  max(value: number, message?: string): this {
    return _lte(this, value, message);
  }

  /**
   * Sets the minimum value (inclusive). Alias for gte.
   *
   * @param value - The minimum number allowed.
   * @param message - Optional error message.
   * @returns Number schema with the minimum value constraint.
   *
   * @example
   * const schema = s.number().min(10);
   */
  min(value: number): this;
  min(value: number, message?: string): this;
  min(value: number, message?: string): this {
    return _gte(this, value, message);
  }

  /**
   * Requires the value to be divisible by the specified number.
   *
   * @param value - The divisor used for the divisibility check.
   * @param message - Optional error message.
   * @returns Number schema with the multiple constraint.
   *
   * @example
   * const schema = s.number().multipleOf(5);
   */
  multipleOf(value: number): this;
  multipleOf(value: number, message?: string): this;
  multipleOf(value: number, message?: string): this {
    return _multipleOf(this, value, message);
  }

  /**
   * Requires the value to be less than zero.
   *
   * @param message - Optional error message.
   * @returns Number schema that accepts only negative values.
   *
   * @example
   * const schema = s.number().negative();
   */
  negative(): this;
  negative(message?: string): this;
  negative(message?: string): this {
    return _lt(this, 0, message);
  }

  /**
   * Requires the value to be zero or greater.
   *
   * @param message - Optional error message.
   * @returns Number schema that accepts only nonnegative values.
   *
   * @example
   * const schema = s.number().nonnegative();
   */
  nonnegative(): this;
  nonnegative(message?: string): this;
  nonnegative(message?: string): this {
    return _gte(this, 0, message);
  }

  /**
   * Requires the value to be zero or less.
   *
   * @param message - Optional error message.
   * @returns Number schema that accepts only nonpositive values.
   *
   * @example
   * const schema = s.number().nonpositive();
   */
  nonpositive(): this;
  nonpositive(message?: string): this;
  nonpositive(message?: string): this {
    return _lte(this, 0, message);
  }

  /**
   * Requires the value to be greater than zero.
   *
   * @param message - Optional error message.
   * @returns Number schema that accepts only positive values.
   *
   * @example
   * const schema = s.number().positive();
   */
  positive(): this;
  positive(message?: string): this;
  positive(message?: string): this {
    return _gt(this, 0, message);
  }
  override [SCHEMA_PARSE](data: unknown): number {
    let input = data;

    if (this[SCHEMA_DEF].coerce) {
      try {
        input = Number(input);
      } catch {
        //
      }
    }

    return this[SCHEMA_ASSERT](isNumber(input), {
      output: input,
      received: data,
    });
  }

  override [SCHEMA_PATTERN](): RegExp {
    if ('pattern' in this[SCHEMA_DEF]) {
      return this[SCHEMA_DEF].pattern as RegExp;
    }

    return new RegExp(/^-?\d+(?:\.\d+)?$/);
  }
}

/**
 * Creates a number schema.
 *
 * @param message - Optional error message.
 * @returns Number schema.
 *
 * @example
 * const schema = s.number();
 */
export function number(): NumberSchema;
export function number(message?: string): NumberSchema;
export function number(message?: string): NumberSchema {
  return new NumberSchema({ message, type: 'number' });
}
