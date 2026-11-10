import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export interface BooleanDef extends SchemaDef<boolean> {
  coerce?: boolean;
  type: 'boolean';
}

export type InternalBooleanDef = BooleanDef & InternalSchemaDef<boolean>;
