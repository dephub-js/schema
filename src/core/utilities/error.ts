import type { SchemaIssue } from '#internal/types/index.ts';

import { JSONX } from '#internal/utils/jsonx.ts';
import { sortIssues } from '#internal/utils/sort-issues.ts';

/** Error thrown when schema validation fails. */
export class SchemaError extends Error {
  declare public readonly issues: SchemaIssue[];
  public override readonly name = 'SchemaError';

  /**
   * Creates a schema validation error.
   *
   * @param issues - One or more validation issues associated with the error.
   *
   * @example
   * const error = new SchemaError({ code: 'invalid_type' });
   */
  constructor(issues: Partial<SchemaIssue> | Partial<SchemaIssue>[]) {
    const issuesArray = Array.isArray(issues) ? issues : [issues];
    const sortedIssues = sortIssues(issuesArray);
    const message = JSONX.stringify(sortedIssues, 2);
    super(message);

    Object.defineProperty(this, 'issues', {
      configurable: false,
      enumerable: false,
      value: sortedIssues,
      writable: false,
    });
  }

  /**
   * Converts the error to a plain object for JSON serialization.
   *
   * @returns An object containing the error name, message, and validation issues.
   * @example
   * const details = error.toJSON();
   */
  public toJSON(): {
    issues: SchemaIssue[];
    message: string;
    name: string;
  } {
    return {
      issues: this.issues,
      message: this.message,
      name: this.name,
    };
  }

  /**
   * Returns the formatted JSON error message.
   *
   * @returns The error message.
   * @example
   * const message = error.toString();
   */
  public override toString(): string {
    return this.message;
  }
}
