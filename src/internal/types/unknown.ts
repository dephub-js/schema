import type { SchemaDef } from './schema.ts';

export interface UnknownDef extends SchemaDef<unknown> {
  type: 'unknown';
}
