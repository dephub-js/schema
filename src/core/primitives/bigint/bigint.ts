import type {
  BigIntDef,
  InternalBigIntDef,
  SchemaKind,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isBigInt } from '#internal/is/bigint.ts';
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

/** Schema for validating bigint values. */
export class BigIntSchema extends Schema<bigint> {
  declare [DEF_TYPE]: InternalBigIntDef;
  public override readonly kind: SchemaKind = 'BigIntSchema';

  constructor(def: BigIntDef) {
    super(def);
  }

  /**
   * Sets the minimum value (exclusive).
   *
   * @param value - The value the input must be greater than.
   * @param message - Optional error message.
   * @returns Bigint schema with the exclusive minimum constraint.
   *
   * @example
   * const schema = s.bigint().gt(10n);
   */
  gt(value: bigint): this;
  gt(value: bigint, message?: string): this;
  gt(value: bigint, message?: string): this {
    return _gt(this, value, message);
  }

  /**
   * Sets the minimum value (inclusive).
   *
   * @param value - The minimum bigint allowed.
   * @param message - Optional error message.
   * @returns Bigint schema with the inclusive minimum constraint.
   *
   * @example
   * const schema = s.bigint().gte(10n);
   */
  gte(value: bigint): this;
  gte(value: bigint, message?: string): this;
  gte(value: bigint, message?: string): this {
    return _gte(this, value, message);
  }

  /**
   * Sets the maximum value (exclusive).
   *
   * @param value - The value the input must be less than.
   * @param message - Optional error message.
   * @returns Bigint schema with the exclusive maximum constraint.
   *
   * @example
   * const schema = s.bigint().lt(100n);
   */
  lt(value: bigint): this;
  lt(value: bigint, message?: string): this;
  lt(value: bigint, message?: string): this {
    return _lt(this, value, message);
  }

  /**
   * Sets the maximum value (inclusive).
   *
   * @param value - The maximum bigint allowed.
   * @param message - Optional error message.
   * @returns Bigint schema with the inclusive maximum constraint.
   *
   * @example
   * const schema = s.bigint().lte(100n);
   */
  lte(value: bigint): this;
  lte(value: bigint, message?: string): this;
  lte(value: bigint, message?: string): this {
    return _lte(this, value, message);
  }

  /**
   * Sets the maximum value (inclusive). Alias for lte.
   *
   * @param value - The maximum bigint allowed.
   * @param message - Optional error message.
   * @returns Bigint schema with the maximum value constraint.
   *
   * @example
   * const schema = s.bigint().max(100n);
   */
  max(value: bigint): this;
  max(value: bigint, message?: string): this;
  max(value: bigint, message?: string): this {
    return _lte(this, value, message);
  }

  /**
   * Sets the minimum value (inclusive). Alias for gte.
   *
   * @param value - The minimum bigint allowed.
   * @param message - Optional error message.
   * @returns Bigint schema with the minimum value constraint.
   *
   * @example
   * const schema = s.bigint().min(10n);
   */
  min(value: bigint): this;
  min(value: bigint, message?: string): this;
  min(value: bigint, message?: string): this {
    return _gte(this, value, message);
  }

  /**
   * Requires the value to be divisible by the specified bigint.
   *
   * @param value - The divisor used for the divisibility check.
   * @param message - Optional error message.
   * @returns Bigint schema with the multiple constraint.
   *
   * @example
   * const schema = s.bigint().multipleOf(5n);
   */
  multipleOf(value: bigint): this;
  multipleOf(value: bigint, message?: string): this;
  multipleOf(value: bigint, message?: string): this {
    return _multipleOf(this, value, message);
  }

  /**
   * Requires the value to be less than zero.
   *
   * @param message - Optional error message.
   * @returns Bigint schema that accepts only negative values.
   *
   * @example
   * const schema = s.bigint().negative();
   */
  negative(): this;
  negative(message?: string): this;
  negative(message?: string): this {
    return _lt(this, BigInt(0), message);
  }

  /**
   * Requires the value to be zero or greater.
   *
   * @param message - Optional error message.
   * @returns Bigint schema that accepts only nonnegative values.
   *
   * @example
   * const schema = s.bigint().nonnegative();
   */
  nonnegative(): this;
  nonnegative(message?: string): this;
  nonnegative(message?: string): this {
    return _gte(this, BigInt(0), message);
  }

  /**
   * Requires the value to be zero or less.
   *
   * @param message - Optional error message.
   * @returns Bigint schema that accepts only nonpositive values.
   *
   * @example
   * const schema = s.bigint().nonpositive();
   */
  nonpositive(): this;
  nonpositive(message?: string): this;
  nonpositive(message?: string): this {
    return _lte(this, BigInt(0), message);
  }

  /**
   * Requires the value to be greater than zero.
   *
   * @param message - Optional error message.
   * @returns Bigint schema that accepts only positive values.
   *
   * @example
   * const schema = s.bigint().positive();
   */
  positive(): this;
  positive(message?: string): this;
  positive(message?: string): this {
    return _gt(this, BigInt(0), message);
  }

  override [SCHEMA_PARSE](data: unknown): bigint {
    let input = data;

    if (this[SCHEMA_DEF].coerce) {
      try {
        input = BigInt(input as any);
      } catch {
        //
      }
    }

    return this[SCHEMA_ASSERT](isBigInt(input), {
      output: input,
      received: data,
    });
  }

  override [SCHEMA_PATTERN](): RegExp {
    return new RegExp(/^-?\d+n?$/);
  }
}

/**
 * Creates a bigint schema.
 *
 * @param message - Optional error message.
 * @returns BigInt schema.
 *
 * @example
 * const schema = s.bigint();
 */
export function bigint(): BigIntSchema;
export function bigint(message?: string): BigIntSchema;
export function bigint(message?: string): BigIntSchema {
  return new BigIntSchema({ message, type: 'bigint' });
}
