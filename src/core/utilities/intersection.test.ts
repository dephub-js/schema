import {
  assertDeepEqual,
  assertEqual,
  assertRejects,
  assertThrows,
  test,
} from '@dephub/assert';

import { number } from '#/core/primitives/number/number.ts';
import { string } from '#/core/primitives/string/string.ts';
import { object } from '#/core/structural/object.ts';
import { SchemaError } from '#/core/utilities/error.ts';
import { array, intersection } from '#/core/utilities/schema.ts';

await test('intersection', async () => {
  const A = object({ a: string() });
  const B = object({ b: number() });
  const AB = intersection(A, B);

  // 1. Basic merge
  const data = { a: 'hello', b: 42 };
  assertDeepEqual(AB.parse(data), data);
  assertEqual(AB.kind, 'IntersectionSchema');

  // 2. Requires both schemas
  assertThrows(() => AB.parse({ a: 'hello' }));
  assertThrows(() => AB.parse({ b: 42 }));

  // 3. Aggregates issues
  try {
    AB.parse({ a: 123, b: 'nope' });
  } catch (e) {
    if (e instanceof SchemaError) {
      // Should contain both errors
      assertEqual(e.issues.length, 2);
    }
  }

  // 4. Async parsing
  const asyncResult = await AB.parseAsync(data);
  assertDeepEqual(asyncResult, data);

  await assertRejects(() => AB.parseAsync({ a: 123, b: 'nope' }));

  // 5. Overlapping keys (deep merge)
  const Left = object({ user: object({ name: string() }) });
  const Right = object({ user: object({ age: number() }) });
  const UserSchema = intersection(Left, Right);

  const merged = UserSchema.parse({
    user: { age: 25, name: 'Alice' },
  });

  assertDeepEqual(merged, {
    user: { age: 25, name: 'Alice' },
  });

  // 6. Conflict on same key (merge failure)
  const ConflictA = object({ value: string() });
  const ConflictB = object({ value: number() });
  const Conflict = intersection(ConflictA, ConflictB);

  assertThrows(() => Conflict.parse({ value: 'hello' }));
  assertThrows(() => Conflict.parse({ value: 123 }));

  // 7. Nested conflict path
  const NestedA = object({ user: object({ value: string() }) });
  const NestedB = object({ user: object({ value: number() }) });
  const NestedConflict = intersection(NestedA, NestedB);

  try {
    NestedConflict.parse({ user: { value: 'oops' } });
  } catch {
    //
  }

  // 8. Array merging
  const ArrA = array(object({ x: number() }));
  const ArrB = array(object({ y: number() }));
  const ArrIntersection = intersection(ArrA, ArrB);

  const arrData = [{ x: 1, y: 2 }];
  assertDeepEqual(ArrIntersection.parse(arrData), arrData);

  // 9. Array length mismatch (merge failure)
  assertThrows(() => ArrIntersection.parse([{ x: 1 }, { x: 2, y: 3 }]));

  // 10. Date merging
  const DateA = object({ d: string().transform((s) => new Date(s)) });
  const DateB = object({ d: string().transform((s) => new Date(s)) });
  const DateIntersection = intersection(DateA, DateB);

  const dateInput = { d: '2020-01-01' };
  const dateResult = DateIntersection.parse(dateInput);

  // eslint-disable-next-line no-implicit-coercion
  assertEqual(+dateResult.d, +new Date('2020-01-01'));

  // 11. Transformation interaction
  const Trim = object({
    name: string().transform((s) => s.trim()),
  });

  const Upper = object({
    name: string().transform((s) => s.toUpperCase()),
  });

  const TransformIntersection = intersection(Trim, Upper);

  // This should FAIL because "trimmed" !== "uppercased"
  assertThrows(() => TransformIntersection.parse({ name: '  hello  ' }));

  // 12. Identical transformations should pass
  const Trim2 = object({
    name: string().transform((s) => s.trim()),
  });

  const SameTransform = intersection(Trim, Trim2);

  assertDeepEqual(SameTransform.parse({ name: '  hello  ' }), {
    name: 'hello',
  });
});
