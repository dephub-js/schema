import type { MaybeAsync, Ref } from '#internal/types/utils.ts';

import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export interface DefaultDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  defaultData: DefaultFn<T>;
  innerType: T;
  type: 'default';
}

export type DefaultFn<T> = () => MaybeAsync<T>;

export type InternalDefaultDef<T extends SomeSchema> = DefaultDef<T> &
  InternalSchemaDef<T[Ref<'OUTPUT'>]>;
