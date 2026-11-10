import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InferTupleInput<
  T extends ReadonlyArray<SomeSchema>,
  Rest extends null | SomeSchema,
> = [
  ...TupleOutputType<T>,
  ...(Rest extends SomeSchema ? Rest[Ref<'INPUT'>][] : []),
];

export type InferTupleOutput<
  T extends ReadonlyArray<SomeSchema>,
  Rest extends null | SomeSchema,
> = [
  ...TupleOutputType<T>,
  ...(Rest extends SomeSchema ? Rest[Ref<'OUTPUT'>][] : []),
];

export type InternalTupleDef<
  T extends ReadonlyArray<SomeSchema> = readonly SomeSchema[],
  R extends null | SomeSchema = null | SomeSchema,
> = InternalSchemaDef<InferTupleOutput<T, R>> & TupleDef<T, R>;

export interface TupleDef<
  T extends ReadonlyArray<SomeSchema> = readonly SomeSchema[],
  R extends null | SomeSchema = null | SomeSchema,
> extends SchemaDef<InferTupleOutput<T, R>> {
  items: T;
  rest?: null | SomeSchema;
  type: 'tuple';
}

export type TupleOutputType<T extends readonly SomeSchema[]> = {
  [K in keyof T]: T[K] extends SomeSchema<infer O> ? O : never;
};
