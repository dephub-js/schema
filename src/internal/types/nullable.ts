import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalNullableDef<T extends SomeSchema> = InternalSchemaDef<
  null | T[Ref<'OUTPUT'>]
> &
  NullableDef<T>;

export interface NullableDef<T extends SomeSchema> extends SchemaDef<
  null | T[Ref<'OUTPUT'>]
> {
  innerType: T;
  type: 'nullable';
}
