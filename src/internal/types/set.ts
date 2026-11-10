import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InternalSetDef<Value extends SomeSchema> = InternalSchemaDef<
  Set<Value[Ref<'OUTPUT'>]>
> &
  SetDef<Value>;

export interface SetDef<Value extends SomeSchema> extends SchemaDef<
  Set<Value[Ref<'OUTPUT'>]>
> {
  type: 'set';
  valueType: Value;
}
