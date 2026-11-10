import type { SchemaDef } from './schema.ts';

export interface NaNDef extends SchemaDef<number> {
  type: 'nan';
}
