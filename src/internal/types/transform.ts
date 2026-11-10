import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { MaybeAsync, Ref } from './utils.ts';

export type InternalTransformDef<
  T extends SomeSchema,
  U,
> = InternalSchemaDef<U> & TransformDef<T, U>;

export interface TransformDef<T extends SomeSchema, U> extends SchemaDef<U> {
  innerType: T;
  transformer: Transformer<T[Ref<'OUTPUT'>], U>;
  type: 'transform';
}

export type Transformer<T, U> = (data: T) => MaybeAsync<U>;
