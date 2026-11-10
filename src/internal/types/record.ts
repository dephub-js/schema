import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export type InfertRecordInput<
  K extends SomeSchema,
  V extends SomeSchema,
> = K[Ref<'OUTPUT'>] extends PropertyKey
  ? { [P in K[Ref<'INPUT'>]]: V[Ref<'INPUT'>] }
  : never;

export type InfertRecordOutput<
  K extends SomeSchema,
  V extends SomeSchema,
> = K[Ref<'OUTPUT'>] extends PropertyKey
  ? { [P in K[Ref<'OUTPUT'>]]: V[Ref<'OUTPUT'>] }
  : never;

export type InternalRecordDef<
  K extends SomeSchema,
  V extends SomeSchema,
> = InternalSchemaDef<InfertRecordOutput<K, V>> & RecordDef<K, V>;

export interface RecordDef<
  K extends SomeSchema,
  V extends SomeSchema,
> extends SchemaDef<InfertRecordOutput<K, V>> {
  keyType: RecordKey<K>;
  type: 'record';
  valueType: V;
}

export type RecordKey<K extends SomeSchema = SomeSchema> =
  K[Ref<'OUTPUT'>] extends PropertyKey ? K : never;
