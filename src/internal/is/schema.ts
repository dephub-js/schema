import type { SomeSchema } from '#internal/types/index.ts';

import { SCHEMA_DEF } from '#internal/utils/symbols.ts';

import { isObject } from './object.ts';

export function isSchema(data: unknown): data is SomeSchema {
  return isObject(data) && SCHEMA_DEF in data;
}
