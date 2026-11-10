import type { FORMAT_CHECK_PUSHED } from '#internal/utils/symbols.ts';

import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export interface Float32Def extends NumberFormatDef {
  format: 'float32';
}

export interface Float64Def extends NumberFormatDef {
  format: 'float64';
}

export interface Int32Def extends NumberFormatDef {
  format: 'int32';
}

export interface IntDef extends NumberFormatDef {
  format: 'safeint';
}

export type InternalNumberDef = InternalSchemaDef<number> & NumberDef;

export interface InternalNumberFormatDef extends InternalNumberDef {
  [FORMAT_CHECK_PUSHED]?: true;
}

export interface NumberDef extends SchemaDef<number> {
  coerce?: boolean;
  type: 'number';
}
export interface NumberFormatDef extends NumberDef {
  format?: NumberFormats;
  [FORMAT_CHECK_PUSHED]?: true;
}

export type NumberFormats =
  'float32' | 'float64' | 'int32' | 'safeint' | 'uint32';

export interface UInt32Def extends NumberFormatDef {
  format: 'uint32';
}
