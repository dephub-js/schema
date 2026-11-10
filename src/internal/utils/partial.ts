import type { ObjectSchema } from '#/core/structural/object.ts';
import type { OptionalSchema } from '#/core/utilities/schema.ts';
import type { Mask, ObjectShape, SomeSchema } from '#internal/types/index.ts';

import { clone } from '#/core/utilities/clone.ts';
import { mergeDefs } from '#internal/utils/def.ts';
import { assignProp } from '#internal/utils/prop.ts';
import { SCHEMA_DEF } from '#internal/utils/symbols.ts';

export function _partial<
  TShape extends ObjectShape,
  M extends Mask<keyof TShape>,
>(
  Class: typeof OptionalSchema<SomeSchema>,
  schema: ObjectSchema<TShape>,
  mask?: M,
) {
  const currDef = schema[SCHEMA_DEF];
  const { checks } = currDef;

  if (checks && checks.length > 0) {
    throw new Error(
      '.partial() cannot be used on object schemas containing refinements',
    );
  }
  const def = mergeDefs(currDef, {
    checks: [],
    get shape() {
      const oldShape: ObjectShape = currDef.shape ?? {};
      const shape: ObjectShape = { ...oldShape };

      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key]) continue;
          shape[key] = Class
            ? new Class({
                innerType: oldShape[key],
                type: 'optional',
              })
            : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class
            ? new Class({
                innerType: oldShape[key as never] as ObjectSchema<ObjectShape>,
                type: 'optional',
              })
            : oldShape[key];
        }
      }
      assignProp(this, 'shape', shape);

      return shape;
    },
    type: schema.type,
  });

  return clone(schema, { ...def, type: schema.type });
}
