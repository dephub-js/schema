import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export type InternalSuccessDef<T extends SomeSchema> =
  InternalSchemaDef<boolean> & SuccessDef<T>;

export interface SuccessDef<T extends SomeSchema> extends SchemaDef<boolean> {
  innerType: T;
  type: 'success';
}
