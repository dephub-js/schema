import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalLazyDef<T extends SomeSchema> = InternalSchemaDef<
  T[Ref<'OUTPUT'>]
> &
  LazyDef<T>;

export interface LazyDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  getter: () => T;
  type: 'lazy';
}
