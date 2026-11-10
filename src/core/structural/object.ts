import type {
  Extend,
  Flatten,
  InfertObjectInput,
  InfertObjectOutput,
  InternalObjectDef,
  Mask,
  ObjectDef,
  ObjectShape,
  Ref,
  SchemaIssue,
  SchemaKind,
  SomeSchema,
  Writeable,
} from '#internal/types/index.ts';

import { enum as _enum, type EnumSchema } from '#/core/literals/enum.ts';
import { never } from '#/core/special/never.ts';
import { unknown } from '#/core/special/unknown.ts';
import { clone } from '#/core/utilities/clone.ts';
import {
  NonOptionalSchema,
  OptionalSchema,
  Schema,
} from '#/core/utilities/schema.ts';
import { isObject } from '#internal/is/object.ts';
import { isSchema } from '#internal/is/schema.ts';
import { defineLazy } from '#internal/utils/define.ts';
import {
  extend as _extend,
  safeExtend as _safeExtend,
} from '#internal/utils/extend.ts';
import { prefixCatchallIssues, prefixIssues } from '#internal/utils/format.ts';
import { _omit } from '#internal/utils/omit.ts';
import { _partial } from '#internal/utils/partial.ts';
import { _pick } from '#internal/utils/pick.ts';
import { _required } from '#internal/utils/require.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PARSE_ASYNC,
  SCHEMA_THROW_ISSUES,
} from '#internal/utils/symbols.ts';

/** Schema for validating object values. */
export class ObjectSchema<
  TShape extends ObjectShape = ObjectShape,
> extends Schema<InfertObjectOutput<TShape>, InfertObjectInput<TShape>> {
  declare [DEF_TYPE]: InternalObjectDef<TShape>;
  public override readonly kind: SchemaKind = 'ObjectSchema';

  /**
   * The underlying shape definition containing the schemas for each key.
   */
  public readonly shape!: TShape;

  constructor(def: ObjectDef<TShape>) {
    super(def);

    defineLazy(this, 'shape', () => def.shape ?? ({} as TShape));
  }

  /**
   * Defines a schema for validating unknown object keys.
   *
   * @param schema - Schema to apply to unknown keys.
   * @returns A new object schema with the specified catchall schema.
   *
   * @example
   * const schema = s.object({ name: s.string() }).catchall(s.number());
   */
  catchall<T extends SomeSchema>(schema: T): this {
    return clone(this, { catchall: schema, type: this.type });
  }

  /**
   * Extends the current object shape with additional or overriding properties.
   *
   * @param shape - Additional properties to add or existing properties to override.
   * @returns Object schema with the extended shape.
   *
   * @example
   * const schema = s.object({ name: s.string() }).extend({
   *   age: s.number(),
   * });
   */
  extend<U extends ObjectShape>(shape: U): ObjectSchema<Extend<TShape, U>> {
    return _extend(
      this as unknown as ObjectSchema<ObjectShape>,
      shape,
    ) as unknown as ObjectSchema<Extend<TShape, U>>;
  }

  /**
   * Returns an enum schema containing all keys of the object shape.
   *
   * @returns Enum schema containing the object shape keys.
   *
   * @example
   * const schema = s.object({ name: s.string(), age: s.number() }).keyof();
   */
  keyof(): EnumSchema<Record<string, string>> {
    return _enum(Object.keys(this[SCHEMA_DEF].shape ?? []));
  }

  /**
   * Allows unknown keys and preserves their original values.
   *
   * @returns Object schema that allows unknown keys.
   *
   * @example
   * const schema = s.object({ name: s.string() }).loose();
   */
  loose(): this {
    return clone(this, { catchall: unknown(), type: this.type });
  }

  /**
   * Returns a new object schema excluding the specified keys.
   *
   * @param mask - Keys to exclude from the object shape.
   * @returns Object schema without the specified keys.
   *
   * @example
   * const schema = s.object({
   *   name: s.string(),
   *   age: s.number(),
   * }).omit({ age: true });
   */
  omit<M extends Mask<keyof TShape>>(
    mask: M & Record<Exclude<keyof M, keyof TShape>, never>,
  ): ObjectSchema<Flatten<Omit<TShape, Extract<keyof TShape, keyof M>>>> {
    return _omit(
      this as unknown as ObjectSchema<ObjectShape>,
      mask,
    ) as unknown as ObjectSchema<
      Flatten<Omit<TShape, Extract<keyof TShape, keyof M>>>
    >;
  }

  /**
   * Makes all properties or a selected subset optional.
   *
   * @param mask - Optional mask specifying which properties to make optional.
   * @returns Object schema with the selected properties made optional.
   *
   * @example
   * const schema = s.object({
   *   name: s.string(),
   *   age: s.number(),
   * }).partial();
   *
   * @example
   * const schema = s.object({
   *   name: s.string(),
   *   age: s.number(),
   * }).partial({ age: true });
   */
  partial(): ObjectSchema<{
    [k in keyof TShape]: OptionalSchema<TShape[k]>;
  }>;
  partial<M extends Mask<keyof TShape>>(
    mask: M & Record<Exclude<keyof M, keyof TShape>, never>,
  ): ObjectSchema<{
    [k in keyof TShape]: k extends keyof M
      ? OptionalSchema<TShape[k]>
      : TShape[k];
  }>;
  partial(mask?: any): any {
    return _partial(OptionalSchema, this, mask);
  }

  /**
   * Returns a new object schema containing only the specified keys.
   *
   * @param mask - Keys to include in the object shape.
   * @returns Object schema containing only the specified keys.
   *
   * @example
   * const schema = s.object({
   *   name: s.string(),
   *   age: s.number(),
   * }).pick({ name: true });
   */
  pick<M extends Mask<keyof TShape>>(
    mask: M & Record<Exclude<keyof M, keyof TShape>, never>,
  ): ObjectSchema<Flatten<Pick<TShape, Extract<keyof TShape, keyof M>>>> {
    return _pick(
      this as unknown as ObjectSchema<ObjectShape>,
      mask,
    ) as unknown as ObjectSchema<
      Flatten<Pick<TShape, Extract<keyof TShape, keyof M>>>
    >;
  }

  /**
   * Makes all properties or a selected subset required.
   *
   * @param mask - Optional mask specifying which properties to make required.
   * @returns Object schema with the selected properties made required.
   *
   * @example
   * const schema = s.object({
   *   name: s.string().optional(),
   *   age: s.number().optional(),
   * }).required();
   *
   * @example
   * const schema = s.object({
   *   name: s.string().optional(),
   *   age: s.number().optional(),
   * }).required({ name: true });
   */
  required(): ObjectSchema<{
    [k in keyof TShape]-?: NonOptionalSchema<Exclude<TShape[k], undefined>>;
  }>;
  required<M extends Mask<keyof TShape>>(
    mask: M & Record<Exclude<keyof M, keyof TShape>, never>,
  ): ObjectSchema<{
    [k in keyof TShape]-?: k extends keyof M
      ? NonOptionalSchema<Exclude<TShape[k], undefined>>
      : TShape[k];
  }>;
  required(mask?: any): any {
    return _required(NonOptionalSchema, this, mask);
  }

  /**
   * Extends the current object shape with additional properties,
   * preventing accidental overrides of existing keys.
   *
   * @param shape - Additional properties to add without overriding existing keys.
   * @returns Object schema with the extended shape.
   *
   * @example
   * const schema = s.object({ name: s.string() }).safeExtend({
   *   age: s.number(),
   * });
   */
  safeExtend<U extends ObjectShape>(shape: U): ObjectSchema<Extend<TShape, U>> {
    return _safeExtend(
      this as unknown as ObjectSchema<ObjectShape>,
      shape,
    ) as unknown as ObjectSchema<Extend<TShape, U>>;
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const { catchall, input, issues, shape } = this.#parseContext(data);
    const result: any = {};

    for (const key in shape) {
      const schema = shape[key];

      if (!isSchema(schema)) {
        throw new Error(`Invalid Schema at "${key}"`);
      }

      const propdata = input[key];
      const parseResult = schema.safeParse(propdata);

      if (!parseResult.success) {
        issues.push(...prefixIssues(parseResult.error.issues, key));
      }

      if (parseResult.success) {
        result[key] = parseResult.data;
      }
    }

    if (catchall) {
      const allowedKeys = new Set(Object.keys(shape));

      const unexpectedKeys = Object.keys(input).filter(
        (k) => !allowedKeys.has(k),
      );

      for (const unexpectedKey of unexpectedKeys) {
        const parseResult = catchall.safeParse(input[unexpectedKey]);

        if (!parseResult.success) {
          if (catchall.kind === 'NeverSchema') {
            issues.push(
              ...prefixCatchallIssues({
                input,
                issues: parseResult.error.issues,
                shape,
                unexpectedKey,
              }),
            );
          } else {
            issues.push(
              ...prefixIssues(parseResult.error.issues, unexpectedKey),
            );
          }
        }

        if (parseResult.success) {
          result[unexpectedKey] = parseResult.data;
        }
      }
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const { catchall, input, issues, shape } = this.#parseContext(data);
    const result: any = {};

    for (const key in shape) {
      const schema = shape[key];

      if (!isSchema(schema)) {
        throw new Error(`Invalid Schema at "${key}"`);
      }

      const propdata = input[key];
      const parseResult = await schema.safeParseAsync(propdata);

      if (!parseResult.success) {
        issues.push(...prefixIssues(parseResult.error.issues, key));
      }

      if (parseResult.success) {
        result[key] = parseResult.data;
      }
    }

    if (catchall) {
      const allowedKeys = new Set(Object.keys(shape));

      const unexpectedKeys = Object.keys(input).filter(
        (k) => !allowedKeys.has(k),
      );

      for (const unexpectedKey of unexpectedKeys) {
        const parseResult = await catchall.safeParseAsync(input[unexpectedKey]);

        if (!parseResult.success) {
          if (catchall.kind === 'NeverSchema') {
            issues.push(
              ...prefixCatchallIssues({
                input,
                issues: parseResult.error.issues,
                shape,
                unexpectedKey,
              }),
            );
          } else {
            issues.push(
              ...prefixIssues(parseResult.error.issues, unexpectedKey),
            );
          }
        }

        if (parseResult.success) {
          result[unexpectedKey] = parseResult.data;
        }
      }
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }

  /**
   * Disallows unknown keys not explicitly defined in the object shape.
   *
   * @returns Object schema that rejects unknown keys.
   *
   * @example
   * const schema = s.object({ name: s.string() }).strict();
   */
  strict(): this {
    return clone(this, { catchall: never(), type: this.type });
  }

  /**
   * Removes unknown keys that are not explicitly defined in the object shape.
   *
   * @returns Object schema that strips unknown keys.
   *
   * @example
   * const schema = s.object({ name: s.string() }).strip();
   */
  strip(): this {
    return clone(this, { catchall: undefined, type: this.type });
  }

  #parseContext(data: unknown): {
    catchall: SomeSchema<any> | undefined;
    input: Record<string, unknown>;
    issues: Array<Partial<SchemaIssue>>;
    shape: ObjectShape;
  } {
    const input = this[SCHEMA_ASSERT](isObject(data), {
      received: data,
    }) as Record<string, unknown>;
    const { catchall, shape } = this[SCHEMA_DEF];
    const issues: Array<Partial<SchemaIssue>> = [];

    return {
      catchall,
      input,
      issues,
      shape: shape ?? {},
    };
  }
}

/**
 * Creates an object schema.
 *
 * @param shape - Optional object shape definition.
 * @param message - Optional error message.
 * @returns Object schema.
 *
 * @example
 * const schema = s.object({
 *   name: s.string(),
 * });
 */
export function object<TShape extends ObjectShape>(): ObjectSchema<
  Writeable<TShape>
>;
export function object<TShape extends ObjectShape>(
  shape?: TShape,
): ObjectSchema<Writeable<TShape>>;
export function object<TShape extends ObjectShape>(
  shape?: TShape,
  message?: string,
): ObjectSchema<Writeable<TShape>>;
export function object<TShape extends ObjectShape>(
  shape?: TShape,
  message?: string,
): ObjectSchema<Writeable<TShape>> {
  return new ObjectSchema({ message, shape, type: 'object' });
}
