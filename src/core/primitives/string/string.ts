/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type {
  InternalStringDef,
  SchemaKind,
  StringDef,
} from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isString } from '#internal/is/string.ts';
import { isUndefined } from '#internal/is/undefined.ts';
import { escapeRegex, testRegex } from '#internal/utils/regex.ts';
import {
  DEF_TYPE,
  SCHEMA_ASSERT,
  SCHEMA_DEF,
  SCHEMA_PARSE,
  SCHEMA_PATTERN,
} from '#internal/utils/symbols.ts';

/** Schema for validating string values. */
export class StringSchema extends Schema<string> {
  declare [DEF_TYPE]: InternalStringDef;
  public override readonly kind: SchemaKind = 'StringSchema';

  constructor(def: StringDef) {
    super(def);
    if (isUndefined(this[SCHEMA_DEF].patterns)) {
      this[SCHEMA_DEF].patterns = new Set();
    }
  }

  /**
   * Requires the string to end with a specific value.
   *
   * @param value - The suffix required.
   * @param message - Optional error message.
   * @returns String schema with the suffix constraint.
   *
   * @example
   * const schema = s.string().endsWith('.com');
   */
  endsWith(value: string): this;
  endsWith(value: string, message?: string): this;
  endsWith(value: string, message?: string): this {
    const next = this.clone();
    const pattern = new RegExp(`.*${escapeRegex(value)}$`);
    next[SCHEMA_DEF].pattern = pattern;
    next[SCHEMA_DEF].patterns.add(pattern);

    return next.check((payload) => {
      if (!payload.data.endsWith(value)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'ends_with',
          message: message ?? `Invalid string: must end with '${value}'`,
        });
      }
    });
  }

  /**
   * Requires the string to contain a specific value.
   *
   * @param value - The substring required.
   * @param message - Optional error message.
   * @returns String schema with the substring constraint.
   *
   * @example
   * const schema = s.string().includes('hello');
   */
  includes(value: string): this;
  includes(value: string, message?: string): this;
  includes(value: string, message?: string): this {
    const next = this.clone();
    const pattern = new RegExp(`.*${escapeRegex(value)}.*`);
    next[SCHEMA_DEF].pattern = pattern;
    next[SCHEMA_DEF].patterns.add(pattern);

    return next.check((payload) => {
      if (!payload.data.includes(value)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'includes',
          message: message ?? `Invalid string: must include with '${value}'`,
        });
      }
    });
  }

  /**
   * Requires the string to have an exact length.
   *
   * @param exactLength - The required number of characters.
   * @param message - Optional error message.
   * @returns String schema with the exact length constraint.
   *
   * @example
   * const schema = s.string().length(10);
   */
  length(exactLength: number): this;
  length(exactLength: number, message?: string): this;
  length(exactLength: number, message?: string): this {
    return this.check((payload) => {
      const input = payload.data;

      if (input.length > exactLength) {
        payload.issues.push({
          code: 'too_big',
          message:
            message ??
            `Too big: expected string to have <=${exactLength} character(s)`,
        });
      }

      if (input.length < exactLength) {
        payload.issues.push({
          code: 'too_small',
          message:
            message ??
            `Too small: expected string to have >=${exactLength} character(s)`,
        });
      }
    });
  }

  /**
   * Requires all characters to be lowercase.
   *
   * @param message - Optional error message.
   * @returns String schema that accepts only lowercase strings.
   *
   * @example
   * const schema = s.string().lowercase();
   */
  lowercase(): this;
  lowercase(message?: string): this;
  lowercase(message?: string): this {
    const next = this.clone();
    const pattern = /^[^A-Z]*$/;
    next[SCHEMA_DEF].pattern = pattern;
    next[SCHEMA_DEF].patterns.add(pattern);

    return next.check((payload) => {
      if (!pattern.test(payload.data)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'lowercase',
          message: message ?? 'Invalid lowercase',
        });
      }
    });
  }

  /**
   * Sets the maximum allowed character length.
   *
   * @param maxLength - Maximum number of characters allowed (inclusive).
   * @param message - Optional error message.
   * @returns String schema with the maximum length constraint.
   *
   * @example
   * const schema = s.string().max(50);
   */
  max(maxLength: number): this;
  max(maxLength: number, message?: string): this;
  max(maxLength: number, message?: string): this {
    const next = this.clone();
    next[SCHEMA_DEF].maximum = maxLength;

    return next.check((payload) => {
      if (payload.data.length > maxLength) {
        payload.issues.push({
          code: 'too_big',
          message:
            message ??
            `Too big: expected string to have <=${maxLength} character(s)`,
        });
      }
    });
  }

  /**
   * Sets the minimum allowed character length.
   *
   * @param minLength - Minimum number of characters required (inclusive).
   * @param message - Optional error message.
   * @returns String schema with the minimum length constraint.
   *
   * @example
   * const schema = s.string().min(3);
   */
  min(minLength: number): this;
  min(minLength: number, message?: string): this;
  min(minLength: number, message?: string): this {
    const next = this.clone();
    next[SCHEMA_DEF].minimum = minLength;

    return next.check((payload) => {
      if (payload.data.length < minLength) {
        payload.issues.push({
          code: 'too_small',
          message:
            message ??
            `Too small: expected string to have >=${minLength} character(s)`,
        });
      }
    });
  }

  /**
   * Disallows empty strings.
   *
   * @param message - Optional error message.
   * @returns String schema that requires at least one character.
   *
   * @example
   * const schema = s.string().nonempty();
   */
  nonempty(): this;
  nonempty(message?: string): this;
  nonempty(message?: string): this {
    return this.check((payload) => {
      if (payload.data.length === 0) {
        payload.issues.push({
          code: 'too_small',
          message:
            message ?? `Too small: expected string to have >=1 character(s)`,
        });
      }
    });
  }

  /**
   * Normalizes the string using Unicode normalization.
   *
   * @returns String schema that normalizes its parsed output.
   *
   * @example
   * const schema = s.string().normalize();
   */
  normalize = (): this => this.overwrite((v) => v.normalize());

  /**
   * Validates the string against a regular expression.
   *
   * @param regex - Regular expression the string must match.
   * @param message - Optional error message.
   * @returns String schema with the regex constraint.
   *
   * @example
   * const schema = s.string().regex(/^[a-z]+$/);
   */
  regex(regex: RegExp): this;
  regex(regex: RegExp, message?: string): this;
  regex(regex: RegExp, message?: string): this {
    const next = this.clone();
    next[SCHEMA_DEF].pattern = regex;
    next[SCHEMA_DEF].patterns.add(regex);

    return next.check((payload) => {
      if (!testRegex(regex, payload.data)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'regex',
          message: message ?? `Invalid format: must match pattern ${regex}`,
        });
      }
    });
  }

  override [SCHEMA_PARSE](data: unknown): string {
    let input = data;

    if (this[SCHEMA_DEF].coerce) {
      try {
        input = String(input);
      } catch {
        //
      }
    }

    return this[SCHEMA_ASSERT](isString(input), {
      output: input,
      received: data,
    });
  }
  override [SCHEMA_PATTERN](): RegExp {
    if ('pattern' in this[SCHEMA_DEF]) {
      return this[SCHEMA_DEF].pattern;
    }

    const { maximum, minimum, patterns } = this[SCHEMA_DEF];

    const regex = `[\\s\\S]{${minimum ?? 0},${maximum ?? ''}}`;

    return [...(patterns ?? [])].at(-1) ?? new RegExp(`^${regex}$`);
  }

  /**
   * Requires the string to start with a specific value.
   *
   * @param value - The prefix required.
   * @param message - Optional error message.
   * @returns String schema with the prefix constraint.
   *
   * @example
   * const schema = s.string().startsWith('https://');
   */
  startsWith(value: string): this;
  startsWith(value: string, message?: string): this;
  startsWith(value: string, message?: string): this {
    const next = this.clone();
    const pattern = new RegExp(`^${escapeRegex(value)}.*`);
    next[SCHEMA_DEF].pattern = pattern;
    next[SCHEMA_DEF].patterns.add(pattern);

    return next.check((payload) => {
      if (!payload.data.startsWith(value)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'starts_with',
          message: message ?? `Invalid string: must start with '${value}'`,
        });
      }
    });
  }

  /**
   * Converts the entire string to lowercase.
   *
   * @returns String schema that transforms its parsed output to lowercase.
   *
   * @example
   * const schema = s.string().toLowerCase();
   */
  toLowerCase = (): this => this.overwrite((v) => v.toLowerCase());

  /**
   * Converts the entire string to uppercase.
   *
   * @returns String schema that transforms its parsed output to uppercase.
   *
   * @example
   * const schema = s.string().toUpperCase();
   */
  toUpperCase = (): this => this.overwrite((v) => v.toUpperCase());

  /**
   * Removes whitespace from both ends of the string.
   *
   * @returns String schema that trims its parsed output.
   *
   * @example
   * const schema = s.string().trim();
   */
  trim = (): this => this.overwrite((v) => v.trim());

  /**
   * Requires all characters to be uppercase.
   *
   * @param message - Optional error message.
   * @returns String schema that accepts only uppercase strings.
   *
   * @example
   * const schema = s.string().uppercase();
   */
  uppercase(): this;
  uppercase(message?: string): this;
  uppercase(message?: string): this {
    const next = this.clone();
    const pattern = /^[^a-z]*$/;
    next[SCHEMA_DEF].pattern = pattern;
    next[SCHEMA_DEF].patterns.add(pattern);

    return next.check((payload) => {
      if (!pattern.test(payload.data)) {
        payload.issues.push({
          code: 'invalid_format',
          format: 'uppercase',
          message: message ?? 'Invalid uppercase',
        });
      }
    });
  }
}

/**
 * Creates a string schema.
 *
 * @param message - Optional error message.
 * @returns String schema.
 *
 * @example
 * const schema = s.string();
 */
export function string(): StringSchema;
export function string(message?: string): StringSchema;
export function string(message?: string): StringSchema {
  return new StringSchema({ message, type: 'string' });
}
