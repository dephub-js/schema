import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalMapDef<
  K extends SomeSchema,
  V extends SomeSchema,
> = InternalSchemaDef<Map<K[Ref<'OUTPUT'>], V[Ref<'OUTPUT'>]>> & MapDef<K, V>;

export interface MapDef<
  K extends SomeSchema,
  V extends SomeSchema,
> extends SchemaDef<Map<K[Ref<'OUTPUT'>], V[Ref<'OUTPUT'>]>> {
  keyType: K;
  type: 'map';
  valueType: V;
}
