import type {
  InternalSchemaDef,
  Params,
  SchemaDef,
  SchemaType,
} from './schema.ts';
import type { MaybeAsync } from './utils.ts';

export interface CustomDef<T> extends SchemaDef<T> {
  fn?: (data: unknown) => MaybeAsync<unknown>;
  params?: Params;
  type: SchemaType;
}

export type InternalCustomDef<T> = CustomDef<T> & InternalSchemaDef<T>;
