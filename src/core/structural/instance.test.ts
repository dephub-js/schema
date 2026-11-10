/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { assertEqual, assertThrows, test } from '@dephub/assert';

import { instanceof as instanceof_ } from './instance.ts';

await test('InstanceofSchema', () => {
  class User {
    // SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
    // constructor(public name: string) {}
    // @ts-expect-error
    constructor(_name) {}
  }

  class Admin extends User {}
  class NotAUser {}

  const UserSchema = instanceof_(User);

  assertEqual(UserSchema.kind, 'CustomSchema');

  // 1. Validates direct instances
  const bob = new User('Bob');
  assertEqual(UserSchema.parse(bob), bob);

  // 2. Validates inherited instances (subclasses)
  const alice = new Admin('Alice');
  assertEqual(UserSchema.parse(alice), alice);

  // 3. Should throw on unrelated classes
  assertThrows(() => UserSchema.parse(new NotAUser()));

  // 4. Should throw on primitives/objects that aren't instances
  assertThrows(() => UserSchema.parse({ name: 'Bob' }));
  assertThrows(() => UserSchema.parse(null));
  assertThrows(() => UserSchema.parse(undefined));

  // 5. Validation with custom message
  const CustomMsgSchema = instanceof_(User, 'Must be a User instance');
  const result = CustomMsgSchema.parse(bob);
  assertEqual(result, bob);

  assertThrows(() => CustomMsgSchema.parse({}));

  // 6. Test with built-in classes
  const DateSchema = instanceof_(Date);
  const now = new Date();
  assertEqual(DateSchema.parse(now), now);
  assertThrows(() => DateSchema.parse('2024-01-01'));
});
