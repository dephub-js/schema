import type {
  ArrayDef,
  CatchCtx,
  CatchDef,
  CatchFn,
  CheckFn,
  DefaultDef,
  DefaultFn,
  InternalArrayDef,
  InternalCatchDef,
  InternalDefaultDef,
  InternalIntersectionDef,
  InternalNonOptionalDef,
  InternalNullableDef,
  InternalOptionalDef,
  InternalPipeDef,
  InternalPrefaultDef,
  InternalReadonlyDef,
  InternalSchemaDef,
  InternalTransformDef,
  InternalUnionDef,
  IntersectionDef,
  MaybeAsync,
  NonOptionalDef,
  NullableDef,
  OptionalDef,
  Params,
  PipeDef,
  PrefaultDef,
  PrefaultFn,
  ReadonlyDef,
  Ref,
  SafeParseResult,
  SchemaDef,
  SchemaIssue,
  SchemaKind,
  SomeSchema,
  TransformDef,
  Transformer,
  UnionDef,
} from '#internal/types/index.ts';

import { isArray } from '#internal/is/array.ts';
import { isDate } from '#internal/is/date.ts';
import { isFunction } from '#internal/is/function.ts';
import { isNull } from '#internal/is/null.ts';
import { isPromiseLike } from '#internal/is/promise.ts';
import { isRecord } from '#internal/is/record.ts';
import { isUndefined } from '#internal/is/undefined.ts';
import {
  defineLazy,
  inheritPattern,
  inheritValues,
} from '#internal/utils/define.ts';
import { format, prefixIssues } from '#internal/utils/format.ts';
import { JSONX } from '#internal/utils/jsonx.ts';
import { normalizeParams } from '#internal/utils/normalize-params.ts';
import { cleanRegex } from '#internal/utils/regex.ts';
import {
  DEF_TYPE,
  INPUT_TYPE,
  OUTPUT_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PARSE_ASYNC,
  SCHEMA_PATTERN,
  SCHEMA_THROW_ISSUES,
  SCHEMA_THROW_SYNC,
} from '#internal/utils/symbols.ts';

import { clone as _clone } from './clone.ts';
import { SchemaError } from './error.ts';

/**
 * Base schema class for all schema definitions.
 */
export abstract class Schema<TOutput = any, TInput = TOutput> {
  declare [DEF_TYPE]: InternalSchemaDef<TOutput>;
  declare [INPUT_TYPE]: TInput;
  /**
   * The unique identifier for the schema kind.
   */
  public readonly kind: SchemaKind = 'AnySchema';
  declare [OUTPUT_TYPE]: TOutput;
  get [SCHEMA_DEF](): this[Ref<'DEF'>] {
    return this.#def;
  }

  /**
   * The unique identifier for the schema type.
   */
  public get type(): this[Ref<'DEF'>]['type'] {
    return this.#def.type;
  }

  readonly #def: this[Ref<'DEF'>];

  constructor(def: SchemaDef<TOutput>) {
    this.#def = {
      checks: [],
      ...def,
    };
  }

  /**
   * Creates an intersection schema that validates against both schemas.
   *
   * @param incoming - Additional schema to intersect with.
   * @returns Intersection schema for combined validation.
   * @example
   * const schema = s.object().and(s.number());
   */
  and<I extends SomeSchema>(incoming: I): IntersectionSchema<this, I> {
    return new IntersectionSchema<this, I>({
      left: this,
      right: incoming,
      type: 'intersection',
    });
  }

  /**
   * Builds an array schema whose elements are validated by this schema.
   *
   * @returns Array schema for this schema's output type.
   * @example
   * const numbers = number().array();
   */
  array(): ArraySchema<this> {
    return new ArraySchema({ element: this, type: 'array' });
  }

  /**
   * Creates a catch schema that returns a fallback value on failure.
   *
   * @param catchValue - Fallback value or function that receives failure context.
   * @returns Schema that catches validation failure.
   * @example
   * const schema = s.number().catch(0);
   */
  catch(catchValue: TOutput): CatchSchema<this>;
  catch(catchValue: CatchFn<TOutput>): CatchSchema<this>;
  catch(catchValue: CatchFn<TOutput> | TOutput): CatchSchema<this> {
    return _catch(this, catchValue);
  }
  /**
   * Adds custom validation checks to the schema clone.
   *
   * @param checks - Check functions that may add issues.
   * @returns Schema clone with the added checks.
   * @throws {Error} When a synchronous parse encounters an async check.
   * @example
   * const schema = s.string().check(({ data }) => data.length > 0);
   */
  check(...checks: Array<CheckFn<TOutput>>): this {
    const next = this.clone();
    next[SCHEMA_DEF].checks.push(...checks);
    return next;
  }
  /**
   * Creates a shallow clone of this schema, preserving current configuration.
   *
   * @returns Cloned schema instance.
   * @example
   * const copy = string().clone();
   */
  clone(): this {
    return _clone(this);
  }

  /**
   * Creates a default schema that supplies a fallback value when input is undefined.
   *
   * @param defaultData - Static default value or function that returns it.
   * @returns Schema with default fallback behavior.
   * @example
   * const schema = s.string().default("anonymous");
   */
  default(defaultData: TOutput): DefaultSchema<this>;
  default(defaultData: DefaultFn<TOutput>): DefaultSchema<this>;
  default(defaultData: DefaultFn<TOutput> | TOutput): DefaultSchema<this> {
    return _default(this, defaultData);
  }

  /**
   * Wraps this schema as exact optional, preserving the inner schema's pattern.
   *
   * @returns Exact optional schema.
   * @example
   * const schema = s.string().exactOptional();
   */
  exactOptional(): ExactOptionalSchema<this> {
    return new ExactOptionalSchema({ innerType: this, type: 'optional' });
  }

  /**
   * Wraps this schema so undefined input is rejected.
   *
   * @returns Non-optional schema.
   * @example
   * const schema = s.string().nonoptional();
   */
  nonoptional(): NonOptionalSchema<this> {
    return new NonOptionalSchema<this>({
      innerType: this,
      type: 'nonoptional',
    });
  }

  /**
   * Wraps this schema so null input is accepted.
   *
   * @returns Nullable schema.
   * @example
   * const schema = s.string().nullable();
   */
  nullable(): NullableSchema<this> {
    return new NullableSchema<this>({ innerType: this, type: 'nullable' });
  }

  /**
   * Wraps this schema as optional, allowing undefined input.
   *
   * @returns Optional schema.
   * @example
   * const schema = s.string().optional();
   */
  optional(): OptionalSchema<this> {
    return new OptionalSchema<this>({ innerType: this, type: 'optional' });
  }
  /**
   * Creates a union schema with this schema and the provided option.
   *
   * @param option - Schema to union with.
   * @returns Union schema combining both options.
   * @example
   * const schema = s.string().or(s.number());
   */
  or<O extends SomeSchema>(option: O): UnionSchema<[this, O]> {
    return new UnionSchema<[this, O]>({
      options: [this, option],
      type: 'union',
    });
  }
  /**
   * Adds an overwrite step to the schema clone.
   *
   * @param fn - Function that transforms the parsed output.
   * @returns Schema clone with the overwrite transformation.
   * @throws {Error} When a synchronous parse encounters an async overwrite.
   * @example
   * const schema = s.string().overwrite((value) => value.trim());
   */
  overwrite(fn: (x: TOutput) => TOutput): this {
    const next = this.clone();

    next[SCHEMA_DEF].checks.push((payload) => {
      payload.data = fn(payload.data);
    });

    return next;
  }

  /**
   * Synchronously validates input and returns the parsed output.
   *
   * @param data - Input value to validate.
   * @returns Parsed output when validation succeeds.
   * @throws {SchemaError} When validation fails.
   * @throws {Error} When a synchronous parse encounters an async overwrite/check.
   * @example
   * const result = schema.parse(value);
   */
  parse(data: unknown): this[Ref<'OUTPUT'>] {
    let result: TOutput = this[SCHEMA_PARSE](data);
    const issues: SchemaIssue[] = [];

    for (const check of this.#def.checks) {
      const payload = { data: result, issues };
      const checkResult = check(payload);

      if (isPromiseLike(checkResult)) {
        throw this[SCHEMA_THROW_SYNC]();
      }

      result = payload.data;
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }
  /**
   * Asynchronously validates input and returns the parsed output.
   *
   * @param data - Input value to validate.
   * @returns Parsed output when validation succeeds.
   * @throws {SchemaError} When validation fails.
   * @example
   * const result = await schema.parseAsync(value);
   */
  async parseAsync(data: unknown): Promise<this[Ref<'OUTPUT'>]> {
    let result: TOutput = await this[SCHEMA_PARSE_ASYNC](data);
    const issues: SchemaIssue[] = [];

    for (const check of this.#def.checks) {
      const payload = { data: result, issues };

      await check(payload);

      result = payload.data;
    }

    this[SCHEMA_THROW_ISSUES](issues);
    return result;
  }

  /**
   * Pipes parsed output from this schema into another schema.
   *
   * @param target - Target schema accepting this schema's output.
   * @returns Pipe schema combining both schemas.
   * @example
   * const schema = s.number().pipe(string());
   */
  pipe<T extends SomeSchema<any, this[Ref<'OUTPUT'>]>>(
    target: SomeSchema<any, this[Ref<'OUTPUT'>]> | T,
  ): PipeSchema<this, T> {
    return new PipeSchema({
      in: this,
      out: target as T,
      type: 'pipe',
    });
  }

  /**
   * Creates a prefault schema that replaces undefined input before validation.
   *
   * @param defaultData - Static default value or function that returns it.
   * @returns Schema that applies a prefault value.
   * @example
   * const schema = s.string().prefault("fallback");
   */
  prefault(defaultData: TOutput): PrefaultSchema<this>;
  prefault(defaultData: PrefaultFn<TOutput>): PrefaultSchema<this>;
  prefault(defaultData: PrefaultFn<TOutput> | TOutput): PrefaultSchema<this> {
    return prefault(this, defaultData);
  }

  /**
   * Wraps this schema as readonly, freezing the parsed value.
   *
   * @returns Readonly schema.
   * @example
   * const schema = s.object().readonly();
   */
  readonly(): ReadonlySchema<this> {
    return new ReadonlySchema<this>({
      innerType: this,
      type: 'readonly',
    });
  }

  /**
   * Adds a custom refine validation step to the schema clone.
   *
   * @param fn - Validation function returning truthy or falsy.
   * @param params - Optional parameters used to construct issues.
   * @returns Schema clone with the refinement.
   * @throws {Error} When a synchronous parse encounters an async refine.
   * @example
   * const schema = s.string().refine((value) => value.includes("@"));
   */
  refine(fn: (data: TOutput) => MaybeAsync<unknown>): this;
  refine(fn: (data: TOutput) => MaybeAsync<unknown>, params?: Params): this;
  refine(fn: (data: TOutput) => MaybeAsync<unknown>, params?: Params): this {
    const next = this.clone();

    next[SCHEMA_DEF].checks.push((payload): MaybeAsync<void> => {
      const addIssue = () => {
        payload.issues.push({
          code: 'custom',
          message: 'Invalid input',
          ...normalizeParams(params),
        });
      };

      const result = fn(payload.data);

      if (isPromiseLike(result)) {
        return (async () => {
          if (!(await result)) addIssue();
        })();
      }

      if (!result) addIssue();
      return undefined;
    });
    return next;
  }

  /**
   * Synchronously validates input and returns a safe parse result.
   *
   * @param data - Input value to validate.
   * @returns Success result or error result.
   * @throws {Error} When an unexpected non-SchemaError is thrown.
   * @example
   * const result = schema.safeParse(value);
   */
  safeParse(data: unknown): SafeParseResult<TOutput> {
    try {
      const parsed = this.parse(data);

      return { data: parsed, success: true };
    } catch (error) {
      if (error instanceof SchemaError) return { error, success: false };
      throw error;
    }
  }
  /**
   * Asynchronously validates input and returns a safe parse result.
   *
   * @param data - Input value to validate.
   * @returns Promise resolving to a success result or error result.
   * @throws {Error} When an unexpected non-SchemaError is thrown.
   * @example
   * const result = await schema.safeParseAsync(value);
   */
  async safeParseAsync(data: unknown): Promise<SafeParseResult<TOutput>> {
    try {
      const parsed = await this.parseAsync(data);

      return { data: parsed, success: true };
    } catch (error) {
      if (error instanceof SchemaError) return { error, success: false };
      throw error;
    }
  }

  /**
   * Asserts `isValid`, throwing a `SchemaError` otherwise, and returns the
   * validated (or overridden) output value.
   */
  [SCHEMA_ASSERT](
    isValid: boolean,
    ctx: Partial<SchemaIssue> & {
      output?: unknown;
      received: unknown;
    },
  ): TOutput {
    if (!isValid) {
      const def = this.#def;

      throw new SchemaError({
        code: ctx.code ?? 'invalid_type',
        expected: ctx.expected ?? def.type,
        message:
          def.message ??
          ctx.message ??
          `Invalid input: expected ${ctx.expected ? JSONX.stringify(ctx.expected) : def.type}, received ${format(
            ctx.received,
          )}`,
        path: ctx.path ?? [],
        received: ctx.received,
      });
    }

    return ('output' in ctx ? ctx.output : ctx.received) as TOutput;
  }

  /**
   * Synchronously parses `data` into the schema's output type.
   */
  abstract [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>];

  /**
   * Asynchronously parses `data` by defaulting to the sync parser.
   */
  async [SCHEMA_PARSE_ASYNC](data: unknown): Promise<this[Ref<'OUTPUT'>]> {
    return await Promise.resolve(this[SCHEMA_PARSE](data));
  }

  /**
   * Returns the regex this schema contributes when composed inside wrapping
   * or combining schemas (e.g. `optional`, `union`, `templateLiteral`).
   */
  [SCHEMA_PATTERN](): RegExp | undefined {
    return undefined;
  }

  /**
   * Throws a `SchemaError` when the collected issues array is non-empty.
   */
  [SCHEMA_THROW_ISSUES](issues: Array<Partial<SchemaIssue>>): void {
    if (issues.length > 0) {
      throw new SchemaError(issues);
    }
  }

  /**
   * Throws when a synchronous parse encounters an async operation.
   */
  [SCHEMA_THROW_SYNC]() {
    throw new Error(
      `${this.kind} cannot be parsed synchronously. Use .parseAsync() instead.`,
    );
  }

  /**
   * Creates a transform schema that maps parsed values.
   *
   * @param transformer - Function that transforms the parsed output.
   * @returns Transform schema.
   * @example
   * const schema = s.string().transform((value) => value.length);
   */
  transform<U>(transformer: Transformer<TOutput, U>): TransformSchema<this, U> {
    return new TransformSchema<this, U>({
      innerType: this,
      transformer,
      type: 'transform',
    });
  }
}

/** Schema for validating arrays of values. */
export class ArraySchema<
  Element extends SomeSchema = SomeSchema,
> extends Schema<Array<Element[Ref<'OUTPUT'>]>, Array<Element[Ref<'INPUT'>]>> {
  declare [DEF_TYPE]: InternalArrayDef<Element>;
  public override readonly kind: SchemaKind = 'ArraySchema';

  constructor(def: ArrayDef<Element>) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const items = this[SCHEMA_ASSERT](isArray(data), { received: data });

    const parseResults = items.map((item) =>
      this[SCHEMA_DEF].element.safeParse(item),
    );

    return this.#handleResults(parseResults);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const items = this[SCHEMA_ASSERT](isArray(data), { received: data });

    const parseResults = await Promise.all(
      items.map(
        async (item) => await this[SCHEMA_DEF].element.safeParseAsync(item),
      ),
    );

    return this.#handleResults(parseResults);
  }

  #handleResults<T = unknown>(parseResults: Array<SafeParseResult<T>>) {
    const issues: SchemaIssue[] = [];
    const result = [];
    let index = 0;

    for (const parseResult of parseResults) {
      if (!parseResult.success) {
        issues.push(...prefixIssues(parseResult.error.issues, index));
      }

      if (parseResult.success) {
        result.push(parseResult.data);
      }

      index += 1;
    }

    if (issues.length > 0) throw new SchemaError(issues);

    return result;
  }
}

/** Schema that returns a fallback value when validation fails. */
export class CatchSchema<T extends SomeSchema = SomeSchema> extends Schema<
  T[Ref<'OUTPUT'>],
  T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalCatchDef<T>;
  public override readonly kind: SchemaKind = 'CatchSchema';

  constructor(def: CatchDef<T>) {
    super(def);
    inheritValues(this, def.innerType);
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const { catchValue, innerType } = this[SCHEMA_DEF];
    const result = innerType.safeParse(data);

    if (result.success) {
      return result.data;
    }

    const catchedValue = catchValue({
      data,
      issues: result.error.issues,
    });

    if (isPromiseLike(catchedValue)) {
      throw this[SCHEMA_THROW_SYNC]();
    }

    return catchedValue;
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const { catchValue, innerType } = this[SCHEMA_DEF];
    const result = await innerType.safeParseAsync(data);

    if (result.success) {
      return result.data;
    }

    const catchedValue = await catchValue({
      data,
      issues: result.error.issues,
    });

    return catchedValue;
  }
}

/** Schema that supplies a default value when input is undefined. */
export class DefaultSchema<T extends SomeSchema = SomeSchema> extends Schema<
  T[Ref<'OUTPUT'>],
  T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalDefaultDef<T>;
  public override readonly kind: SchemaKind = 'DefaultSchema';

  constructor(def: DefaultDef<T>) {
    super(def);
    inheritValues(this, def.innerType);
  }

  [SCHEMA_PARSE](data?: unknown): T[Ref<'OUTPUT'>] {
    const { defaultData: getDefaultData, innerType } = this[SCHEMA_DEF];
    const defaultData = getDefaultData();

    if (isPromiseLike(defaultData)) {
      throw this[SCHEMA_THROW_SYNC]();
    }

    if (isUndefined(data)) {
      return defaultData;
    }

    const parsed = innerType.parse(data);
    const result = isUndefined(parsed) ? defaultData : parsed;

    return result;
  }

  override async [SCHEMA_PARSE_ASYNC](
    data?: unknown,
  ): Promise<T[Ref<'OUTPUT'>]> {
    const { defaultData: getDefaultData, innerType } = this[SCHEMA_DEF];
    const defaultData = getDefaultData();

    if (isUndefined(data)) {
      return defaultData;
    }

    const pased = await innerType.parseAsync(data);
    const result = isUndefined(pased) ? defaultData : pased;

    return result;
  }
}

/** Exact optional schema that preserves the inner schema’s pattern. */
export class ExactOptionalSchema<
  T extends SomeSchema = SomeSchema,
> extends Schema<T[Ref<'OUTPUT'>], T[Ref<'INPUT'>]> {
  declare [DEF_TYPE]: InternalOptionalDef<T>;
  public override readonly kind: SchemaKind = 'ExactOptionalSchema';

  constructor(def: OptionalDef<T>) {
    super(def);
    inheritPattern(this, def.innerType);
    inheritValues(this, def.innerType);
  }

  override [SCHEMA_PARSE](data: unknown): T[Ref<'OUTPUT'>] {
    return this[SCHEMA_DEF].innerType.parse(data);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<T[Ref<'OUTPUT'>]> {
    return await this[SCHEMA_DEF].innerType.parseAsync(data);
  }
}

/** Schema that validates input against both schemas. */
export class IntersectionSchema<
  T extends SomeSchema = SomeSchema,
  I extends SomeSchema = SomeSchema,
> extends Schema<
  I[Ref<'OUTPUT'>] & T[Ref<'OUTPUT'>],
  I[Ref<'INPUT'>] & T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalIntersectionDef<T, I>;
  public override readonly kind: SchemaKind = 'IntersectionSchema';

  constructor(def: IntersectionDef<T, I>) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const { left, right } = this[SCHEMA_DEF];
    const leftResult = left.safeParse(data);
    const rightResult = right.safeParse(data);

    return this.#handleResults(leftResult, rightResult);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const { left, right } = this[SCHEMA_DEF];
    const leftResult = await left.safeParseAsync(data);
    const rightResult = await right.safeParseAsync(data);

    return this.#handleResults(leftResult, rightResult);
  }

  #handleResults(
    leftResult: SafeParseResult<Ref<'OUTPUT'>>,
    rightResult: SafeParseResult<Ref<'OUTPUT'>>,
  ): Ref<'OUTPUT'> {
    if (!leftResult.success || !rightResult.success) {
      const issues = [
        ...(leftResult.success ? [] : leftResult.error.issues),
        ...(rightResult.success ? [] : rightResult.error.issues),
      ];

      throw new SchemaError(issues);
    }

    const merged = this.#mergeValues(leftResult.data, rightResult.data);

    if (!merged.success) {
      throw new Error(
        `Unmergable intersection. Error path: ${JSONX.stringify(
          merged.errorPath,
        )}`,
      );
    }

    return merged.data as Ref<'OUTPUT'>;
  }

  #mergeValues(
    left: unknown,
    right: unknown,
  ): {
    data?: unknown;
    errorPath?: Array<unknown>;
    success: boolean;
  } {
    if (left === right) {
      return { data: left, success: true };
    }

    if (isDate(left) && isDate(right) && Number(left) === Number(right)) {
      return { data: left, success: true };
    }

    if (isRecord(left) && isRecord(right)) {
      const rightKeys = Object.keys(right);
      const sharedKeys = Object.keys(left).filter((key) =>
        rightKeys.includes(key),
      );

      const mergedRecord = {
        ...left,
        ...right,
      };

      for (const key of sharedKeys) {
        const result = this.#mergeValues(left[key], right[key]);
        if (!result.success) {
          return {
            errorPath: [key, ...(result.errorPath ?? [])],
            success: false,
          };
        }
        mergedRecord[key] = result.data;
      }
      return { data: mergedRecord, success: true };
    }

    if (isArray(left) && isArray(right)) {
      if (left.length !== right.length) {
        return { errorPath: [], success: false };
      }

      const mergedArray = [];

      for (let i = 0; i < left.length; i += 1) {
        const result = this.#mergeValues(left[i], right[i]);
        if (!result.success) {
          return {
            errorPath: [i, ...(result.errorPath ?? [])],
            success: false,
          };
        }
        mergedArray.push(result.data);
      }
      return { data: mergedArray, success: true };
    }

    return { errorPath: [], success: false };
  }
}

/** Schema that rejects undefined input even when the inner schema accepts it. */
export class NonOptionalSchema<
  T extends SomeSchema = SomeSchema,
> extends Schema<
  Exclude<T[Ref<'OUTPUT'>], undefined>,
  Exclude<T[Ref<'INPUT'>], undefined>
> {
  declare [DEF_TYPE]: InternalNonOptionalDef<T>;
  public override readonly kind: SchemaKind = 'NonOptionalSchema';

  constructor(def: NonOptionalDef<T>) {
    super(def);

    defineLazy(this[SCHEMA_DEF], 'values', () => {
      const { values } = def.innerType[SCHEMA_DEF];

      return values
        ? new Set([...values].filter((x) => x !== undefined))
        : undefined;
    });
  }

  override [SCHEMA_PARSE](data: unknown): T[Ref<'OUTPUT'>] {
    const { innerType } = this[SCHEMA_DEF];
    const parseResult = innerType.safeParse(data);

    if (parseResult.success) {
      this[SCHEMA_ASSERT](!isUndefined(data), {
        received: data,
      });
    }

    return innerType.parse(data);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<T[Ref<'OUTPUT'>]> {
    const { innerType } = this[SCHEMA_DEF];
    const parseResult = await innerType.safeParseAsync(data);

    if (parseResult.success) {
      this[SCHEMA_ASSERT](!isUndefined(data), {
        received: data,
      });
    }

    return await innerType.parseAsync(data);
  }
}

/** Schema that accepts null and validates non-null values. */
export class NullableSchema<T extends SomeSchema = SomeSchema> extends Schema<
  null | T[Ref<'OUTPUT'>],
  null | T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalNullableDef<T>;
  public override readonly kind: SchemaKind = 'NullableSchema';

  constructor(def: NullableDef<T>) {
    super(def);

    const { innerType } = this[SCHEMA_DEF];
    const pattern = innerType[SCHEMA_PATTERN]();

    inheritValues(this, innerType);

    if (pattern) {
      defineLazy(
        this,
        SCHEMA_PATTERN,
        () => () => new RegExp(`^(${cleanRegex(pattern.source)}|null)$`),
      );
    }
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    if (isNull(data)) return null;
    const { innerType } = this[SCHEMA_DEF];

    return innerType.parse(data);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    if (isNull(data)) return null;
    const { innerType } = this[SCHEMA_DEF];

    return await innerType.parseAsync(data);
  }
}

/** Schema that accepts undefined and validates non-undefined values. */
export class OptionalSchema<T extends SomeSchema = SomeSchema> extends Schema<
  T[Ref<'OUTPUT'>] | undefined,
  T[Ref<'INPUT'>] | undefined
> {
  declare [DEF_TYPE]: InternalOptionalDef<T>;
  public override readonly kind: SchemaKind = 'OptionalSchema';

  constructor(def: OptionalDef<T>) {
    super(def);

    const { innerType } = this[SCHEMA_DEF];
    const pattern = innerType[SCHEMA_PATTERN]();

    inheritValues(this, innerType);

    if (pattern) {
      defineLazy(
        this,
        SCHEMA_PATTERN,
        () => () => new RegExp(`^(${cleanRegex(pattern.source)})?$`),
      );
    }
  }

  override [SCHEMA_PARSE](data?: unknown): this[Ref<'OUTPUT'>] {
    if (isUndefined(data)) return undefined;
    const { innerType } = this[SCHEMA_DEF];

    return innerType.parse(data);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data?: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    if (isUndefined(data)) return undefined;
    const { innerType } = this[SCHEMA_DEF];

    return await innerType.parseAsync(data);
  }
}

export { _default as default };

/** Schema that pipes output from one schema into another. */
export class PipeSchema<
  A extends SomeSchema = SomeSchema,
  B extends SomeSchema = SomeSchema,
> extends Schema<B[Ref<'OUTPUT'>], A[Ref<'INPUT'>]> {
  declare [DEF_TYPE]: InternalPipeDef<A, B>;
  declare readonly in: A;
  public override readonly kind: SchemaKind = 'PipeSchema';
  declare readonly out: B;

  constructor(def: PipeDef<A, B>) {
    super(def);

    this.in = def.in;
    this.out = def.out;
    inheritValues(this, def.in);
  }

  override [SCHEMA_PARSE](data: unknown): B[Ref<'OUTPUT'>] {
    const { in: left, out: right } = this[SCHEMA_DEF];
    const parsed = left.parse(data);

    return right.parse(parsed);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<B[Ref<'OUTPUT'>]> {
    const { in: left, out: right } = this[SCHEMA_DEF];
    const parsed = await left.parseAsync(data);

    return await right.parseAsync(parsed);
  }
}

/** Schema that replaces undefined input before parsing. */
export class PrefaultSchema<T extends SomeSchema = SomeSchema> extends Schema<
  T[Ref<'OUTPUT'>],
  T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalPrefaultDef<T>;
  public override readonly kind: SchemaKind = 'PrefaultSchema';

  constructor(def: PrefaultDef<T>) {
    super(def);
    inheritValues(this, def.innerType);
  }

  override [SCHEMA_PARSE](data?: unknown): T[Ref<'OUTPUT'>] {
    const { defaultData: getDefaultData, innerType } = this[SCHEMA_DEF];

    const defaultData = getDefaultData();

    if (isPromiseLike(defaultData)) {
      throw this[SCHEMA_THROW_SYNC]();
    }

    const value = isUndefined(data) ? defaultData : data;

    return innerType.parse(value);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data?: unknown,
  ): Promise<T[Ref<'OUTPUT'>]> {
    const { defaultData, innerType } = this[SCHEMA_DEF];
    const value = isUndefined(data) ? await defaultData() : data;

    return await innerType.parseAsync(value);
  }
}

/** Schema that freezes parsed output as readonly. */
export class ReadonlySchema<T extends SomeSchema = SomeSchema> extends Schema<
  Readonly<T[Ref<'OUTPUT'>]>,
  Readonly<T[Ref<'INPUT'>]>
> {
  declare [DEF_TYPE]: InternalReadonlyDef<T>;
  public override readonly kind: SchemaKind = 'ReadonlySchema';

  constructor(def: ReadonlyDef<T>) {
    super(def);
    inheritValues(this, def.innerType);
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const result = this[SCHEMA_DEF].innerType.safeParse(data);

    if (!result.success) {
      throw new SchemaError(result.error.issues);
    }

    return Object.freeze(result.data);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const result = await this[SCHEMA_DEF].innerType.safeParseAsync(data);

    if (!result.success) {
      throw new SchemaError(result.error.issues);
    }

    return Object.freeze(result.data);
  }
}

/** Schema that transforms parsed values using a transformer. */
export class TransformSchema<T extends SomeSchema, U> extends Schema<
  U,
  T[Ref<'INPUT'>]
> {
  declare [DEF_TYPE]: InternalTransformDef<T, U>;
  public override readonly kind: SchemaKind = 'TransformSchema';

  constructor(def: TransformDef<T, U>) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): U {
    const { innerType, transformer } = this[SCHEMA_DEF];
    const parsed = innerType.parse(data);
    const transformered = transformer(parsed);

    if (isPromiseLike(transformered)) {
      throw this[SCHEMA_THROW_SYNC]();
    }

    return transformered;
  }

  override async [SCHEMA_PARSE_ASYNC](data: unknown): Promise<U> {
    const { innerType, transformer } = this[SCHEMA_DEF];
    const parsed = await innerType.parseAsync(data);
    const transformered = await transformer(parsed);

    return transformered;
  }
}

/** Schema that validates input against one of several schemas. */
export class UnionSchema<
  const T extends readonly SomeSchema[] = SomeSchema[],
> extends Schema<T[number][Ref<'OUTPUT'>], T[number][Ref<'INPUT'>]> {
  declare [DEF_TYPE]: InternalUnionDef<T>;
  public override readonly kind: SchemaKind = 'UnionSchema';

  constructor(def: UnionDef<T>) {
    super(def);

    if (def.options.length > 0) {
      if (def.options.every((opt) => opt[SCHEMA_PATTERN]())) {
        defineLazy(this, SCHEMA_PATTERN, () => {
          const patterns = def.options.map(
            (opt) => opt[SCHEMA_PATTERN]() ?? new RegExp(''),
          );

          return () =>
            new RegExp(
              `^(${patterns
                .map((pattern) => cleanRegex(pattern.source))
                .join('|')})$`,
            );
        });
      }

      if (def.options.every((opt) => opt[SCHEMA_DEF].values)) {
        defineLazy(
          this[SCHEMA_DEF],
          'values',
          () =>
            new Set(
              def.options.flatMap((opt) =>
                Array.from(opt[SCHEMA_DEF].values ?? []),
              ),
            ),
        );
      }
    }
  }

  override [SCHEMA_PARSE](data: unknown): this[Ref<'OUTPUT'>] {
    const { options } = this[SCHEMA_DEF];
    const issues: SchemaIssue[] = [];

    for (const option of options) {
      const result = option.safeParse(data);
      if (result.success) return result.data;
      issues.push(...result.error.issues);
    }

    throw this.#throwIssues(issues);
  }

  override async [SCHEMA_PARSE_ASYNC](
    data: unknown,
  ): Promise<this[Ref<'OUTPUT'>]> {
    const { options } = this[SCHEMA_DEF];
    const issues: SchemaIssue[] = [];

    for (const option of options) {
      const result = await option.safeParseAsync(data);
      if (result.success) return result.data;
      issues.push(...result.error.issues);
    }

    throw this.#throwIssues(issues);
  }

  #throwIssues(issues: SchemaIssue[]) {
    if (issues.length > 0) {
      throw new SchemaError(issues);
    }
    throw new SchemaError([
      {
        code: 'invalid_union',
        message: 'Invalid input',
      },
    ]);
  }
}

/**
 * Creates an array schema for the given element schema.
 *
 * @param element - Schema for array elements.
 * @param message - Optional error message.
 * @returns Array schema.
 *
 * @example
 * const schema = s.array(s.string());
 */
export function array<Element extends SomeSchema>(
  element: Element,
): ArraySchema<Element>;
export function array<Element extends SomeSchema>(
  element: Element,
  message?: string,
): ArraySchema<Element>;
export function array<Element extends SomeSchema>(
  element: Element,
  message?: string,
): ArraySchema<Element> {
  return new ArraySchema({ element, message, type: 'array' });
}

/**
 * Creates an exact optional schema that preserves pattern matching.
 *
 * @param innerType - Schema to wrap.
 * @returns Exact optional schema.
 *
 * @example
 * const schema = s.exactOptional(s.string());
 */
export function exactOptional<T extends SomeSchema>(
  innerType: T,
): ExactOptionalSchema<T> {
  return new ExactOptionalSchema<T>({ innerType, type: 'optional' });
}

/**
 * Creates an intersection schema from two schemas.
 *
 * @param left - First schema.
 * @param right - Second schema.
 * @returns Intersection schema combining both.
 *
 * @example
 * const schema = s.intersection(
 *  s.object({ name: s.string() }),
 *  s.object({ age: s.number() }),
 * );
 */
export function intersection<T extends SomeSchema, I extends SomeSchema>(
  left: T,
  right: I,
): IntersectionSchema<T, I> {
  return new IntersectionSchema<T, I>({
    left,
    right,
    type: 'intersection',
  });
}

/**
 * Creates a nonoptional schema from an inner schema.
 *
 * @param innerType - Schema to wrap.
 * @param message - Optional error message.
 * @returns Non-optional schema.
 *
 * @example
 * const schema = s.nonoptional(s.string());
 */
export function nonoptional<T extends SomeSchema>(
  innerType: T,
): NonOptionalSchema<T>;
export function nonoptional<T extends SomeSchema>(
  innerType: T,
  message?: string,
): NonOptionalSchema<T>;
export function nonoptional<T extends SomeSchema>(
  innerType: T,
  message?: string,
): NonOptionalSchema<T> {
  return new NonOptionalSchema<T>({ innerType, message, type: 'nonoptional' });
}

/**
 * Creates a nullable schema from an inner schema.
 *
 * @param innerType - Schema to wrap.
 * @returns Nullable schema.
 *
 * @example
 * const schema = s.nullable(s.string());
 */
export function nullable<T extends SomeSchema>(
  innerType: T,
): NullableSchema<T> {
  return new NullableSchema<T>({ innerType, type: 'nullable' });
}

/**
 * Creates an optional schema from an inner schema.
 *
 * @param innerType - Schema to wrap.
 * @returns Optional schema.
 *
 * @example
 * const schema = s.optional(s.string());
 */
export function optional<T extends SomeSchema>(
  innerType: T,
): OptionalSchema<T> {
  return new OptionalSchema<T>({ innerType, type: 'optional' });
}

/**
 * Creates a pipe schema combining two schemas.
 *
 * @param in_ - Source schema whose parsed output is passed to the next schema.
 * @param out - Target schema that processes the source schema's parsed output.
 * @returns Pipe schema combining both schemas.
 *
 * @example
 * const schema = s.pipe(s.number(), s.string());
 */
export function pipe<
  const A extends SomeSchema,
  B extends SomeSchema<any, A[Ref<'OUTPUT'>]> = SomeSchema<
    any,
    A[Ref<'OUTPUT'>]
  >,
>(in_: A, out: B | SomeSchema<any, A[Ref<'OUTPUT'>]>): PipeSchema<A, B> {
  return new PipeSchema({
    in: in_,
    out: out as B,
    type: 'pipe',
  });
}

/**
 * Creates a prefault schema that normalizes undefined input.
 *
 * @param innerType - Schema to validate.
 * @param defaultData - Static fallback or generator function.
 * @returns Prefault schema.
 *
 * @example
 * const schema = s.prefault(s.string(), "fallback");
 */
export function prefault<T extends SomeSchema = SomeSchema>(
  innerType: T,
  defaultData: DefaultFn<T[Ref<'OUTPUT'>]> | T[Ref<'OUTPUT'>],
): PrefaultSchema<T> {
  return new PrefaultSchema<T>({
    defaultData: isFunction(defaultData) ? defaultData : () => defaultData,
    innerType,
    type: 'prefault',
  });
}

/**
 * Creates a readonly schema from an inner schema.
 *
 * @param innerType - Schema to wrap.
 * @param message - Optional error message.
 * @returns Readonly schema.
 *
 * @example
 * const schema = s.readonly(s.object());
 */
export function readonly<T extends SomeSchema>(innerType: T): ReadonlySchema<T>;
export function readonly<T extends SomeSchema>(
  innerType: T,
  message?: string,
): ReadonlySchema<T>;
export function readonly<T extends SomeSchema>(
  innerType: T,
  message?: string,
): ReadonlySchema<T> {
  return new ReadonlySchema<T>({ innerType, message, type: 'readonly' });
}

/**
 * Creates a transform schema that maps parsed values.
 *
 * @param innerType - Schema to parse first.
 * @param transformer - Function that transforms the parsed value.
 * @returns Transform schema.
 *
 * @example
 * const schema = s.transform(s.number(), (value) => value.toString());
 */
export function transform<T extends SomeSchema, U>(
  innerType: T,
  transformer: Transformer<T[Ref<'OUTPUT'>], U>,
): TransformSchema<T, U> {
  return new TransformSchema<T, U>({
    innerType,
    transformer,
    type: 'transform',
  });
}

/**
 * Creates a union schema from an array of schemas.
 *
 * @param options - Schemas to union.
 * @param message - Optional error message.
 * @returns Union schema.
 *
 * @example
 * const schema = s.union([s.string(), s.number()]);
 */
export function union<const T extends readonly SomeSchema[]>(
  options: T,
): UnionSchema<T>;
export function union<const T extends readonly SomeSchema[]>(
  options: T,
  message?: string,
): UnionSchema<T>;
export function union<const T extends readonly SomeSchema[]>(
  options: T,
  message?: string,
): UnionSchema<T> {
  return new UnionSchema<T>({ message, options, type: 'union' });
}

/**
 * Creates a catch schema that supplies fallback behavior.
 *
 * @param innerType - Schema to validate.
 * @param catchValue - Static fallback or function.
 * @returns Catch schema.
 *
 * @example
 * const schema = s.catch(s.number(), 0);
 */
function _catch<T extends SomeSchema>(
  innerType: T,
  catchValue: T[Ref<'OUTPUT'>],
): CatchSchema<T>;
function _catch<T extends SomeSchema>(
  innerType: T,
  catchValue: CatchFn<T[Ref<'OUTPUT'>]>,
): CatchSchema<T>;
function _catch<T extends SomeSchema>(
  innerType: T,
  catchValue: CatchFn<T[Ref<'OUTPUT'>]> | T[Ref<'OUTPUT'>],
): CatchSchema<T>;
function _catch<T extends SomeSchema>(
  innerType: T,
  catchValue: CatchFn<T[Ref<'OUTPUT'>]> | T[Ref<'OUTPUT'>],
): CatchSchema<T> {
  return new CatchSchema({
    catchValue: isFunction(catchValue)
      ? catchValue
      : (_ctx: CatchCtx) => catchValue,
    innerType,
    type: 'catch',
  });
}

export { _catch as catch };

/**
 * Creates a default schema with fallback behavior.
 *
 * @param innerType - Schema to validate.
 * @param defaultData - Static default or generator function.
 * @returns Default schema.
 *
 * @example
 * const schema = s.default(s.string(), "guest");
 */
function _default<T extends SomeSchema = SomeSchema>(
  innerType: T,
  defaultData: DefaultFn<T[Ref<'OUTPUT'>]> | T[Ref<'OUTPUT'>],
): DefaultSchema<T> {
  return new DefaultSchema<T>({
    defaultData: isFunction(defaultData) ? defaultData : () => defaultData,
    innerType,
    type: 'default',
  });
}
