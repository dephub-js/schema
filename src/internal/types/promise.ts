import type { Ref } from '#internal/types/utils.ts';

import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export type InternalPromiseDef<T extends SomeSchema> = InternalSchemaDef<
  T[Ref<'OUTPUT'>]
> &
  PromiseDef<T>;

export interface PromiseDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  innerType: T;
  type: 'promise';
}
