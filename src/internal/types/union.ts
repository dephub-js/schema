import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalUnionDef<T extends readonly SomeSchema[]> =
  InternalSchemaDef<T[number][Ref<'OUTPUT'>]> & UnionDef<T>;

export interface UnionDef<T extends readonly SomeSchema[]> extends SchemaDef<
  T[number][Ref<'OUTPUT'>]
> {
  options: T;
  type: 'union';
}
