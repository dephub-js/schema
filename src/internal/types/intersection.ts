import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalIntersectionDef<
  T extends SomeSchema,
  I extends SomeSchema,
> = InternalSchemaDef<I[Ref<'OUTPUT'>] & T[Ref<'OUTPUT'>]> &
  IntersectionDef<T, I>;

export interface IntersectionDef<
  T extends SomeSchema,
  U extends SomeSchema,
> extends SchemaDef<T[Ref<'OUTPUT'>] & U[Ref<'OUTPUT'>]> {
  left: T;
  right: U;
  type: 'intersection';
}
