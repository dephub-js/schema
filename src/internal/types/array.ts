import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export interface ArrayDef<T extends SomeSchema> extends SchemaDef<
  Array<T[Ref<'OUTPUT'>]>
> {
  element: T;
  type: 'array';
}

export type InternalArrayDef<T extends SomeSchema> = ArrayDef<T> &
  InternalSchemaDef<Array<T[Ref<'OUTPUT'>]>>;
