import type { SchemaDef } from './schema.ts';

export interface AnyDef extends SchemaDef<any> {
  type: 'any';
}
