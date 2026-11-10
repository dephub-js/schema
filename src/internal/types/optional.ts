import type { Ref } from '#internal/types/utils.ts';

import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export type InternalOptionalDef<T extends SomeSchema> = InternalSchemaDef<
  T[Ref<'OUTPUT'>] | undefined
> &
  OptionalDef<T>;

export interface OptionalDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>] | undefined
> {
  innerType: T;
  type: 'optional';
}
