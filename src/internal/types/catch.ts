import type {
  InternalSchemaDef,
  MaybeAsync,
  SchemaDef,
  SchemaIssue,
  SomeSchema,
} from '#internal/types/index.ts';

import type { Ref } from './utils.ts';

export interface CatchCtx {
  data: unknown;
  issues: Array<SchemaIssue>;
}

export interface CatchDef<T extends SomeSchema = SomeSchema> extends SchemaDef<
  T[Ref<'OUTPUT'>]
> {
  catchValue: CatchFn<T>;
  innerType: T;
  type: 'catch';
}

export type CatchFn<T> = (ctx: CatchCtx) => MaybeAsync<T>;

export type InternalCatchDef<T extends SomeSchema> = CatchDef<T> &
  InternalSchemaDef<T[Ref<'OUTPUT'>]>;
