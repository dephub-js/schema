import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export interface DateDef extends SchemaDef<Date> {
  coerce?: boolean;
  type: 'date';
}

export type InternalDateDef = DateDef & InternalSchemaDef<Date>;
