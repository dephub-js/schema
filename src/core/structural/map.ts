import type {
  InternalMapDef,
  MapDef,
  Ref,
  SchemaIssue,
  SchemaKind,
  SomeSchema,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isMap } from '#internal/is/map.ts';
import { prefixIssues } from '#internal/utils/format.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PARSE_ASYNC,
  SCHEMA_THROW_ISSUES,
} from '#internal/utils/symbols.ts';

/** Schema for validating Map objects. */
export class MapSchema<
  Key extends SomeSchema = SomeSchema,
  Value extends SomeSchema = SomeSchema,
> extends Schema<
  Map<Key[Ref<'OUTPUT'>], Value[Ref<'OUTPUT'>]>,
  Map<Key[Ref<'INPUT'>], Value[Ref<'INPUT'>]>
> {
  declare [DEF_TYPE]: InternalMapDef<Key, Value>;
  public override readonly kind: SchemaKind = 'MapSchema';

  constructor(def: MapDef<Key, Value>) {
    super(def);
  }

  /**
   * Sets the maximum number of entries allowed in the Map.
   *
   * @param maxSize - Maximum number of entries allowed (inclusive).
   * @param message - Optional error message.
   * @returns Map schema with the maximum size constraint.
   *
   * @example
   * const schema = s.map(s.string(), s.number()).max(5);
   */
  max(maxSize: number): this;
  max(maxSize: number, message?: string): this;
  max(maxSize: number, message?: string): this {
    return this.check((payload) => {
      if (payload.data.size > maxSize) {
        payload.issues.push({
          code: 'too_big',
          message:
            message ?? `Too big: expected map to have <=${maxSize} entries`,
        });
      }
    });
  }

  /**
   * Sets the minimum number of entries required in the Map.
   *
   * @param minSize - Minimum number of entries required (inclusive).
   * @param message - Optional error message.
   * @returns Map schema with the minimum size constraint.
   *
   * @example
   * const schema = s.map(s.string(), s.number()).min(2);
   */
  min(minSize: number): this;
  min(minSize: number, message?: string): this;
  min(minSize: number, message?: string): this {
    return this.check((payload) => {
      if (payload.data.size < minSize) {
        payload.issues.push({
          code: 'too_small',
          message:
            message ?? `Too small: expected map to have >=${minSize} entries`,
        });
      }
    });
  }

  /**
   * Requires the Map to contain at least one entry.
   *
   * @param message - Optional error message.
   * @returns Map schema requiring at least one entry.
   *
   * @example
   * const schema = s.map(s.string(), s.number()).nonempty();
   */
  nonempty(): this;
  nonempty(message?: string): this;
  nonempty(message?: string): this {
    return this.check((payload) => {
      if (payload.data.size === 0) {
        payload.issues.push({
          code: 'too_small',
          message: message ?? 'Too small: expected map to have >=1 entries',
        });
      }
    });
  }
  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const input = this[SCHEMA_ASSERT](isMap(data), { received: data });
    const issues: Array<Partial<SchemaIssue>> = [];
    const result = new Map();

    for (const [key, value] of input) {
      const { keyType, valueType } = this[SCHEMA_DEF];
      const keyResult = keyType.safeParse(key);
      const valueResult = valueType.safeParse(value);

      if (!keyResult.success) {
        issues.push(...prefixIssues(keyResult.error.issues, key));
      }

      if (!valueResult.success) {
        issues.push(...prefixIssues(valueResult.error.issues, key));
      }

      if (keyResult.success && valueResult.success) {
        result.set(keyResult.data, valueResult.data);
      }
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }
  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const input = this[SCHEMA_ASSERT](isMap(data), { received: data });
    const issues: Array<Partial<SchemaIssue>> = [];
    const result = new Map();

    for (const [key, value] of input) {
      const { keyType, valueType } = this[SCHEMA_DEF];
      const keyResult = await keyType.safeParseAsync(key);
      const valueResult = await valueType.safeParseAsync(value);

      if (!keyResult.success) {
        issues.push(...prefixIssues(keyResult.error.issues, key));
      }

      if (!valueResult.success) {
        issues.push(...prefixIssues(valueResult.error.issues, value));
      }

      if (keyResult.success && valueResult.success) {
        result.set(keyResult.data, valueResult.data);
      }
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }

  /**
   * Requires the Map to have an exact number of entries.
   *
   * @param size - Exact number of entries required.
   * @param message - Optional error message.
   * @returns Map schema with the exact size constraint.
   *
   * @example
   * const schema = s.map(s.string(), s.number()).size(3);
   */
  size(size: number): this;
  size(size: number, message?: string): this;
  size(size: number, message?: string): this {
    return this.check((payload) => {
      const input = payload.data;

      if (input.size !== size) {
        if (input.size <= size) {
          payload.issues.push({
            code: 'too_small',
            message:
              message ?? `Too small: expected map to have >=${size} entries`,
          });
        }

        if (input.size >= size) {
          payload.issues.push({
            code: 'too_big',
            message:
              message ?? `Too big: expected map to have <=${size} entries`,
          });
        }
      }
    });
  }
}

/**
 * Creates a map schema.
 *
 * @param keyType - Schema for map keys.
 * @param valueType - Schema for map values.
 * @param message - Optional error message.
 * @returns Map schema.
 *
 * @example
 * const schema = s.map(s.string(), s.number());
 */
export function map<Key extends SomeSchema, Value extends SomeSchema>(
  keyType: Key,
  valueType: Value,
): MapSchema<Key, Value>;
export function map<Key extends SomeSchema, Value extends SomeSchema>(
  keyType: Key,
  valueType: Value,
  message?: string,
): MapSchema<Key, Value>;
export function map<Key extends SomeSchema, Value extends SomeSchema>(
  keyType: Key,
  valueType: Value,
  message?: string,
): MapSchema<Key, Value> {
  return new MapSchema({
    keyType,
    message,
    type: 'map',
    valueType,
  });
}
