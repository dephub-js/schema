import type { SomeSchema } from '#internal/types/index.ts';

import { SCHEMA_DEF } from './symbols.ts';

export function _multipleOf<T extends SomeSchema>(
  schema: T,
  value: bigint | number,
  message?: string,
): T {
  const allowed = ['number', 'bigint'];

  if (!allowed.includes(schema.type)) {
    throw new Error(
      `multipleOf is not compatible with ${schema.kind}. Use number() or bigint().`,
    );
  }

  const next = schema.clone();

  next[SCHEMA_DEF].checks.push((payload) => {
    const input = payload.data;
    let isMultiple: boolean;

    if (typeof input === 'bigint' && typeof value === 'bigint') {
      isMultiple = input % value === 0n;
    } else {
      isMultiple = Number(input) % Number(value) === 0;
    }

    if (!isMultiple) {
      payload.issues.push({
        code: 'not_multiple_of',
        expected: value,
        message:
          message ?? `Invalid ${next.type}: must be a multiple of ${value}`,
        received: input,
      });
    }
  });

  return next;
}
