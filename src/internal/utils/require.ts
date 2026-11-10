import type { ObjectSchema } from '#/core/structural/object.ts';
import type { NonOptionalSchema } from '#/core/utilities/schema.ts';
import type { Mask, ObjectShape, SomeSchema } from '#internal/types/index.ts';

import { clone } from '#/core/utilities/clone.ts';
import { mergeDefs } from '#internal/utils/def.ts';
import { assignProp } from '#internal/utils/prop.ts';
import { SCHEMA_DEF } from '#internal/utils/symbols.ts';

export function _required<
  TShape extends ObjectShape,
  M extends Mask<keyof TShape>,
>(
  Class: typeof NonOptionalSchema<SomeSchema>,
  schema: ObjectSchema<TShape>,
  mask?: M,
): ObjectSchema<TShape> {
  const def = mergeDefs(schema[SCHEMA_DEF], {
    get shape() {
      const oldShape: ObjectShape = schema[SCHEMA_DEF].shape ?? {};
      const shape: ObjectShape = { ...oldShape };

      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key]) continue;
          shape[key] = new Class({
            innerType: oldShape[key],
            type: 'nonoptional',
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class({
            innerType: oldShape[key],
            type: 'nonoptional',
          });
        }
      }
      assignProp(this, 'shape', shape);
      return shape;
    },
    type: schema.type,
  });

  return clone(schema, { ...def, type: schema.type });
}
