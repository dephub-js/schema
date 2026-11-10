import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalNonOptionalDef<T extends SomeSchema> = InternalSchemaDef<
  Exclude<T[Ref<'OUTPUT'>], undefined>
> &
  NonOptionalDef<T>;

export interface NonOptionalDef<T extends SomeSchema> extends SchemaDef<
  Exclude<T[Ref<'OUTPUT'>], undefined>
> {
  innerType: T;
  type: 'nonoptional';
}
