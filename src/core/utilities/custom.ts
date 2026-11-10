import type {
  CustomDef,
  InternalCustomDef,
  SchemaIssue,
  SchemaKind,
} from '#internal/types/index.ts';

import { isPromiseLike } from '#internal/is/promise.ts';
import { normalizeParams } from '#internal/utils/normalize-params.ts';
import {
  DEF_TYPE,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PARSE_ASYNC,
  SCHEMA_THROW_SYNC,
} from '#internal/utils/symbols.ts';

import { SchemaError } from './error.ts';
import { Schema } from './schema.ts';

/** Schema for validating values with a custom validation function. */
export class CustomSchema<T = unknown> extends Schema<T> {
  declare [DEF_TYPE]: InternalCustomDef<T>;
  public override readonly kind: SchemaKind = 'CustomSchema';

  constructor(def: CustomDef<T>) {
    super({ ...def, message: normalizeParams(def.params).message });
  }

  override [SCHEMA_PARSE](data: unknown): T {
    const { fn } = this[SCHEMA_DEF];

    if (fn) {
      const result = fn(data);

      if (isPromiseLike(result)) {
        throw this[SCHEMA_THROW_SYNC]();
      }

      if (!result) {
        throw this.#throwCustomIssue(data);
      }
    }

    return data as T;
  }

  override async [SCHEMA_PARSE_ASYNC](data: unknown): Promise<T> {
    const { fn } = this[SCHEMA_DEF];

    if (fn && !(await fn(data))) {
      throw this.#throwCustomIssue(data);
    }

    return data as T;
  }

  #throwCustomIssue(data: unknown) {
    const { params, type } = this[SCHEMA_DEF];

    throw new SchemaError({
      code: 'custom',
      expected: type,
      message: 'Invalid input',
      received: data,
      ...normalizeParams(params),
    });
  }
}

/**
 * Creates a custom schema.
 *
 * @param fn - Optional custom validation function.
 * @param params - Optional validation message or parameters.
 * @returns Custom schema.
 *
 * @example
 * const schema = s.custom((data) => typeof data === 'string');
 * const schemaWithMessage = s.custom((data) => data > 0, 'Value must be positive');
 */
export function custom<T = unknown>(): CustomSchema<T>;
export function custom<T = unknown>(
  fn?: (data: unknown) => unknown,
): CustomSchema<T>;
export function custom<T = unknown>(
  fn?: (data: unknown) => unknown,
  params?: string,
): CustomSchema<T>;
export function custom<T = unknown>(
  fn?: (data: unknown) => unknown,
  params?: Partial<SchemaIssue>,
): CustomSchema<T>;
export function custom<T = unknown>(
  fn?: (data: unknown) => unknown,
  params?: Partial<SchemaIssue> | string,
): CustomSchema<T>;
export function custom<T = unknown>(
  fn?: (data: unknown) => unknown,
  params?: Partial<SchemaIssue> | string,
): CustomSchema<T> {
  return new CustomSchema<T>({ fn, params, type: 'custom' });
}
