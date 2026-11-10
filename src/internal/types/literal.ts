import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export type InternalLiteralDef<T extends Literal> = InternalSchemaDef<T> &
  LiteralDef<T>;

export type Literal = bigint | boolean | null | number | string | undefined;

export interface LiteralDef<T extends Literal> extends SchemaDef<T> {
  literaldata: T;
  type: 'literal';
}
