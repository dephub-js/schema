import type { InternalSchemaDef, SchemaDef } from './schema.ts';
import type { Flatten } from './utils.ts';

export interface EnumDef<T extends EnumLike = EnumLike> extends SchemaDef<
  T[keyof T]
> {
  enumValues: T;
  type: 'enum';
}

export type EnumLike = Readonly<Record<string, EnumValue>>;

export type EnumValue = number | string;

export type InternalEnumDef<T extends EnumLike = EnumLike> = EnumDef<T> &
  InternalSchemaDef<T[keyof T]>;

export type ToEnum<T extends EnumValue> = Flatten<{
  [k in T]: k;
}>;
