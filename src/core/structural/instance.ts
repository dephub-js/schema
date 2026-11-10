import { custom, type CustomSchema } from '#/core/utilities/custom.ts';

/**
 * Creates a schema that validates whether a value is an instance of a given class.
 *
 * @typeParam T - The instance type to validate.
 * @param instance - The class constructor used for the instanceof check.
 * @param message - Optional error message.
 * @returns Custom schema for validating class instances.
 *
 * @example
 * class User {
 *   constructor(public name: string) {}
 * }
 *
 * const schema = s.instanceof(User);
 *
 * @example
 * const schema = s.instanceof(User, 'Expected a User instance');
 */
function instanceof_<T>(instance: new (...args: any[]) => T): CustomSchema<T>;
function instanceof_<T>(
  instance: new (...args: any[]) => T,
  message?: string,
): CustomSchema<T>;
function instanceof_<T>(
  instance: new (...args: any[]) => T,
  message?: string,
): CustomSchema<T> {
  return custom<T>((data) => data instanceof instance, message);
}

export { instanceof_ as instanceof };
