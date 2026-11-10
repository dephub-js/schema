import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalReadonlyDef<T extends SomeSchema> = InternalSchemaDef<
  Readonly<T[Ref<'OUTPUT'>]>
> &
  ReadonlyDef<T>;

export interface ReadonlyDef<T extends SomeSchema> extends SchemaDef<
  Readonly<T[Ref<'OUTPUT'>]>
> {
  innerType: T;
  type: 'readonly';
}
