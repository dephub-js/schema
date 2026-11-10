import type {
  InternalStringFormatDef,
  StringFormatDef,
  StringFormats,
} from '#internal/types/index.ts';

import { testRegex } from '#internal/utils/regex.ts';
import {
  DEF_TYPE,
  FORMAT_CHECK_PUSHED,
  SCHEMA_DEF,
} from '#internal/utils/symbols.ts';

import { StringSchema } from './string.ts';

/** Schema for validating string formats. */
export class StringFormatSchema extends StringSchema {
  declare [DEF_TYPE]: InternalStringFormatDef;

  constructor(def: StringFormatDef) {
    super(def);
    const _def = this[SCHEMA_DEF];

    if (_def.pattern && !_def[FORMAT_CHECK_PUSHED]) {
      _def[FORMAT_CHECK_PUSHED] = true;

      _def.checks.push((payload) => {
        const input = payload.data;

        if (_def.pattern && !testRegex(_def.pattern, input)) {
          payload.issues.push({
            code: 'invalid_format',
            expected: _def.format,
            message:
              _def.message ??
              `Invalid format: must match pattern ${_def.pattern}`,
            received: input,
          });
        }
      });
    }
  }
}

/**
 * Creates a string schema for the given format and pattern.
 *
 * @param format - Named string format.
 * @param pattern - Pattern to validate against.
 * @param message - Optional error message.
 * @returns String format schema.
 *
 * @example
 * const schema = s.stringFormat('email', /.+@.+\..+/);
 */
export function stringFormat(
  format: StringFormats,
  pattern: RegExp,
): StringFormatSchema;
export function stringFormat(
  format: StringFormats,
  pattern: RegExp,
  message?: string,
): StringFormatSchema;
export function stringFormat(
  format: StringFormats,
  pattern: RegExp,
  message?: string,
): StringFormatSchema {
  return new StringFormatSchema({ format, message, pattern, type: 'string' });
}
