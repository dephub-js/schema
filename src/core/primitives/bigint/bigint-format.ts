import type {
  BigIntFormatDef,
  BigIntFormats,
  InternalBigIntFormatDef,
} from '#internal/types/index.ts';

import {
  type DEF_TYPE,
  FORMAT_CHECK_PUSHED,
  SCHEMA_DEF,
} from '#internal/utils/symbols.ts';

import { BigIntSchema } from './bigint.ts';

/** Schema for validating formatted bigint ranges. */
export class BigIntFormatSchema extends BigIntSchema {
  declare [DEF_TYPE]: InternalBigIntFormatDef;

  constructor(def: BigIntFormatDef) {
    super(def);
    const _def = this[SCHEMA_DEF];

    const [min, max] = {
      int64: [BigInt('-9223372036854775808'), BigInt('9223372036854775807')],
      uint64: [BigInt(0), BigInt('18446744073709551615')],
    }[_def.format];

    if (!_def[FORMAT_CHECK_PUSHED]) {
      _def[FORMAT_CHECK_PUSHED] = true;

      _def.checks.push((payload) => {
        const input = payload.data;

        if (input < min) {
          payload.issues.push({
            code: 'too_small',
            expected: min.toString(),
            message:
              _def.message ?? `Too small: expected bigint to be >=${min}`,
            received: input,
          });
        }

        if (input > max) {
          payload.issues.push({
            code: 'too_big',
            expected: max.toString(),
            message: _def.message ?? `Too big: expected bigint to be <=${max}`,
            received: input,
          });
        }
      });
    }
  }
}

/**
 * Creates a bigint schema for the given format.
 *
 * @param format - Bigint format name.
 * @param message - Optional error message.
 * @returns BigInt format schema.
 *
 * @example
 * const schema = s.bigintFormat('int64');
 */
export function bigintFormat(format: BigIntFormats): BigIntFormatSchema;
export function bigintFormat(
  format: BigIntFormats,
  message?: string,
): BigIntFormatSchema;
export function bigintFormat(
  format: BigIntFormats,
  message?: string,
): BigIntFormatSchema {
  return new BigIntFormatSchema({ format, message, type: 'bigint' });
}
