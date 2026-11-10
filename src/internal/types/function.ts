import type { OUTPUT_TYPE } from '#internal/utils/symbols.ts';

import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';
import type { Ref } from './utils.ts';

export interface FunctionDef<
  Args extends FunctionIn = FunctionIn,
  Returns extends FunctionOut = FunctionOut,
> extends SchemaDef<InfertFunctionOutput<Args, Returns>> {
  input: Args;
  output: Returns;
  type: 'function';
}

export type FunctionIn = SomeSchema & { [OUTPUT_TYPE]: unknown[] };

export type FunctionOut = SomeSchema;

export type InfertFunctionInput<
  Args extends FunctionIn = FunctionIn,
  Returns extends FunctionOut = FunctionOut,
> = (
  ...args: Args[Ref<'INPUT'>]
) => Promise<Returns[Ref<'INPUT'>]> | Returns[Ref<'INPUT'>];

export type InfertFunctionOutput<
  Args extends FunctionIn = FunctionIn,
  Returns extends FunctionOut = FunctionOut,
> = (
  ...args: Args[Ref<'OUTPUT'>]
) => Promise<Returns[Ref<'OUTPUT'>]> | Returns[Ref<'OUTPUT'>];

export type InternalFunctionDef<
  Args extends FunctionIn = FunctionIn,
  Returns extends FunctionOut = FunctionOut,
> = FunctionDef<Args, Returns> &
  InternalSchemaDef<InfertFunctionOutput<Args, Returns>>;
