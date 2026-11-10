import type { SchemaError } from '#/core/utilities/error.ts';
import type {
  DEF_TYPE,
  INPUT_TYPE,
  OUTPUT_TYPE,
  SCHEMA_DEF,
  SCHEMA_PATTERN,
} from '#internal/utils/symbols.ts';

import type { MaybeAsync, Ref } from './utils.ts';

export type _SchemaType =
  | 'any'
  | 'array'
  | 'bigint'
  | 'boolean'
  | 'catch'
  | 'custom'
  | 'date'
  | 'default'
  | 'enum'
  | 'error'
  | 'file'
  | 'function'
  | 'intersection'
  | 'lazy'
  | 'literal'
  | 'map'
  | 'nan'
  | 'never'
  | 'nonoptional'
  | 'null'
  | 'nullable'
  | 'number'
  | 'object'
  | 'optional'
  | 'prefault'
  | 'promise'
  | 'readonly'
  | 'record'
  | 'regexp'
  | 'response'
  | 'set'
  | 'string'
  | 'success'
  | 'symbol'
  | 'template_literal'
  | 'transform'
  | 'tuple'
  | 'undefined'
  | 'union'
  | 'unknown'
  | 'void';

export type CheckFn<T> = (payload: {
  data: T;
  issues: Array<Partial<SchemaIssue>>;
}) => MaybeAsync<void>;

export interface ExtendedDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  [x: string]: any;
}

export interface InternalSchemaDef<T> extends SchemaDef<T> {
  checks: Array<CheckFn<T>>;
}

export type Params = Partial<SchemaIssue> | string;

export type SafeParseError = {
  data?: never;
  error: SchemaError;
  success: false;
};

export type SafeParseResult<T> = SafeParseError | SafeParseSuccess<T>;

export type SafeParseSuccess<T> = {
  data: T;
  error?: never;
  success: true;
};

export interface SchemaDef<T> {
  checks?: Array<CheckFn<T>>;
  message?: string;
  type: SchemaType;
  values?: Set<PropertyKey>;
}

export interface SchemaIssue {
  code: string;
  expected?: unknown;
  format?: string;
  message: string;
  path: Array<PropertyKey>;
  received?: unknown;
}

export type SchemaKind =
  | 'AndSchema'
  | 'AnySchema'
  | 'ArraySchema'
  | 'Base64Schema'
  | 'Base64URLSchema'
  | 'BigIntSchema'
  | 'BigIntSchemaCoerced'
  | 'BooleanSchema'
  | 'BooleanSchemaCoerced'
  | 'CatchSchema'
  | 'CheckSchema'
  | 'CIDRv4Schema'
  | 'CIDRv6Schema'
  | 'CUID2Schema'
  | 'CUIDSchema'
  | 'CustomSchema'
  | 'DateSchema'
  | 'DateSchemaCoerced'
  | 'DefaultSchema'
  | 'E164Schema'
  | 'EmailSchema'
  | 'EmojiSchema'
  | 'EndsWithSchema'
  | 'EnumSchema'
  | 'ExactOptionalSchema'
  | 'FileSchema'
  | 'Float32Schema'
  | 'Float64Schema'
  | 'FunctionSchema'
  | 'GUIDSchema'
  | 'InstanceOfSchema'
  | 'Int32Schema'
  | 'Int64Schema'
  | 'IntersectionSchema'
  | 'IntSchema'
  | 'IPv4Schema'
  | 'IPv6Schema'
  | 'ISODateSchema'
  | 'ISODateTimeSchema'
  | 'ISODurationSchema'
  | 'ISOTimeSchema'
  | 'JWTSchema'
  | 'KSUIDchema'
  | 'LazySchema'
  | 'LiteralSchema'
  | 'LowerCaseSchema'
  | 'MapSchema'
  | 'NanoIDSchema'
  | 'NaNSchema'
  | 'NeverSchema'
  | 'NonOptionalSchema'
  | 'NullableSchema'
  | 'NullSchema'
  | 'NumberSchema'
  | 'NumberSchemaCoerced'
  | 'ObjectSchema'
  | 'OptionalSchema'
  | 'OrSchema'
  | 'PipeSchema'
  | 'PrefaultSchema'
  | 'PromiseSchema'
  | 'ReadonlySchema'
  | 'RecordSchema'
  | 'RefineSchema'
  | 'RegexSchema'
  | 'SetSchema'
  | 'StartsWithSchema'
  | 'StringSchema'
  | 'StringSchemaCoerced'
  | 'SuccessSchema'
  | 'SymbolSchema'
  | 'TelSchema'
  | 'TemplateLiteralSchema'
  | 'TransformSchema'
  | 'TupleSchema'
  | 'UInt32Schema'
  | 'UInt64Schema'
  | 'ULIDSchema'
  | 'UndefinedSchema'
  | 'UnionSchema'
  | 'UnknownSchema'
  | 'UpperCaseSchema'
  | 'URLSchema'
  | 'UUIDSchema'
  | 'VoidSchema'
  | 'XIDSchema';

export type SchemaType =
  | 'any'
  | 'array'
  | 'bigint'
  | 'boolean'
  | 'catch'
  | 'custom'
  | 'date'
  | 'default'
  | 'enum'
  | 'file'
  | 'function'
  | 'int'
  | 'intersection'
  | 'lazy'
  | 'literal'
  | 'map'
  | 'nan'
  | 'never'
  | 'nonoptional'
  | 'null'
  | 'nullable'
  | 'number'
  | 'object'
  | 'optional'
  | 'pipe'
  | 'prefault'
  | 'promise'
  | 'readonly'
  | 'record'
  | 'set'
  | 'string'
  | 'success'
  | 'symbol'
  | 'template_literal'
  | 'transform'
  | 'tuple'
  | 'undefined'
  | 'union'
  | 'unknown'
  | 'void';

export interface SomeSchema<T = any, I = T> {
  check(...checks: Array<CheckFn<T>>): this;
  clone(): this;
  readonly [DEF_TYPE]: InternalSchemaDef<T>;
  readonly [INPUT_TYPE]: I;
  kind: SchemaKind;
  readonly [OUTPUT_TYPE]: T;
  parse(data: unknown): T;
  parseAsync(data: unknown): Promise<T>;
  safeParse(data: unknown): SafeParseResult<T>;
  safeParseAsync(data: unknown): Promise<SafeParseResult<T>>;
  [SCHEMA_DEF]: this[Ref<'DEF'>];
  [SCHEMA_PATTERN]: () => RegExp | undefined;
  type: this[Ref<'DEF'>]['type'];
}
