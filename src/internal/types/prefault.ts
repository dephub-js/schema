import type { MaybeAsync, Ref } from '#internal/types/utils.ts';

import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export type InternalPrefaultDef<T extends SomeSchema> = InternalSchemaDef<
  T[Ref<'OUTPUT'>]
> &
  PrefaultDef<T>;

export interface PrefaultDef<T extends SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  defaultData: PrefaultFn<T>;
  innerType: T;
  type: 'prefault';
}

export type PrefaultFn<T> = () => MaybeAsync<T>;
