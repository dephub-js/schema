import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalPipeDef<
  A extends SomeSchema,
  B extends SomeSchema<A[Ref<'OUTPUT'>]>,
> = InternalSchemaDef<A[Ref<'OUTPUT'>]> & PipeDef<A, B>;

export interface PipeDef<
  A extends SomeSchema,
  B extends SomeSchema<A[Ref<'OUTPUT'>]>,
> extends SchemaDef<A[Ref<'OUTPUT'>]> {
  in: A;
  out: B;
  type: 'pipe';
}
