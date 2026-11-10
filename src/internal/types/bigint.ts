import type { FORMAT_CHECK_PUSHED } from '#internal/utils/symbols.ts';

import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export interface BigIntDef extends SchemaDef<bigint> {
  coerce?: boolean;
  type: 'bigint';
}

export interface BigIntFormatDef extends SchemaDef<bigint> {
  format: BigIntFormats;
  [FORMAT_CHECK_PUSHED]?: true;
  type: 'bigint';
}

export type BigIntFormats = 'int64' | 'uint64';
export interface Int64Def extends BigIntFormatDef {
  format: 'int64';
  type: 'bigint';
}

export type InternalBigIntDef = BigIntDef & InternalSchemaDef<bigint>;

export interface InternalBigIntFormatDef extends InternalBigIntDef {
  format: BigIntFormats;
  [FORMAT_CHECK_PUSHED]?: true;
}

export interface UInt64Def extends BigIntFormatDef {
  format: 'uint64';
  type: 'bigint';
}
