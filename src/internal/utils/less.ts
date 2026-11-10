import type { SomeSchema } from '#internal/types/index.ts';

import { SCHEMA_DEF } from './symbols.ts';

export function _lt<T extends SomeSchema>(
  schema: T,
  value: bigint | number,
  message?: string,
) {
  return lessThan(schema, { inclusive: false, message, value });
}

export function _lte<T extends SomeSchema>(
  schema: T,
  value: bigint | number,
  message?: string,
) {
  return lessThan(schema, { inclusive: true, message, value });
}

export function lessThan<T extends SomeSchema>(
  schema: T,
  params: { inclusive?: boolean; message?: string; value: bigint | number },
): T {
  const allowed = ['number', 'bigint'];

  if (!allowed.includes(schema.type)) {
    throw new Error(
      `lessThan is not compatible with ${schema.kind}. Use number() or bigint().`,
    );
  }

  const { inclusive, message, value } = params;

  const next = schema.clone();

  next[SCHEMA_DEF].checks.push((payload) => {
    const input = payload.data;
    const isSatisfied = inclusive ? input <= value : input < value;

    if (!isSatisfied) {
      payload.issues.push({
        code: 'too_big',
        message: message ?? `Too big: expected ${next.type} to be <=${value}`,
        received: input,
      });
    }
  });

  return next;
}
