/* eslint-disable perfectionist/sort-modules */
import type {
  InternalSuccessDef,
  Ref,
  SafeParseResult,
  SchemaKind,
  SuccessDef,
} from '#internal/types/index.ts';
import type { SomeSchema } from '#internal/types/schema.ts';

import { SchemaError } from '#/core/utilities/error.ts';
import { Schema } from '#/core/utilities/schema.ts';
import {
  DEF_TYPE,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PARSE_ASYNC,
} from '#internal/utils/symbols.ts';

/** Schema that validates if the inner schema is successful and returns true. */
export class SuccessSchema<T extends SomeSchema = SomeSchema> extends Schema<
  boolean,
  T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalSuccessDef<T>;
  public override readonly kind: SchemaKind = 'SuccessSchema';

  constructor(def: SuccessDef<T>) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): true {
    const result = this[SCHEMA_DEF].innerType.safeParse(data);

    return this.#handleSuccess(result);
  }

  override async [SCHEMA_PARSE_ASYNC](data: unknown): Promise<true> {
    const result = await this[SCHEMA_DEF].innerType.safeParseAsync(data);

    return this.#handleSuccess(result);
  }

  #handleSuccess<TSuccess>(result: SafeParseResult<TSuccess>) {
    if (!result.success) {
      throw new SchemaError(result.error.issues);
    }
    return result.success;
  }
}

/**
 * Creates a schema that checks whether another schema validates successfully.
 *
 * @param innerType - Schema whose validation result determines success.
 * @param message - Optional error message.
 * @returns Success schema.
 *
 * @example
 * const schema = s.success(s.string());
 *
 * @example
 * const schema = s.success(s.number(), 'Number validation failed');
 */
export function success<T extends SomeSchema>(innerType: T): SuccessSchema<T>;
export function success<T extends SomeSchema>(
  innerType: T,
  message?: string,
): SuccessSchema<T>;
export function success<T extends SomeSchema>(
  innerType: T,
  message?: string,
): SuccessSchema<T> {
  return new SuccessSchema({ innerType, message, type: 'success' });
}
