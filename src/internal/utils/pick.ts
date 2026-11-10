import type { ObjectSchema } from '#/core/structural/object.ts';
import type { Mask, ObjectShape } from '#internal/types/index.ts';

import { clone } from '#/core/utilities/clone.ts';
import { mergeDefs } from '#internal/utils/def.ts';
import { assignProp } from '#internal/utils/prop.ts';
import { SCHEMA_DEF } from '#internal/utils/symbols.ts';

export function _pick<
  TShape extends Partial<ObjectShape>,
  M extends Mask<keyof TShape>,
>(schema: ObjectSchema<ObjectShape>, mask: M): ObjectSchema<ObjectShape> {
  const currDef = schema[SCHEMA_DEF];
  const { checks } = currDef;

  if (checks && checks.length > 0) {
    throw new Error(
      '.pick() cannot be used on object schemas containing refinements',
    );
  }
  const def = mergeDefs(schema[SCHEMA_DEF], {
    checks: [],
    get shape() {
      const newShape: ObjectShape = {};
      for (const key in mask) {
        if (!(key in (currDef.shape ?? {}))) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key]) continue;
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        newShape[key] = (currDef.shape ?? {})[key];
      }
      assignProp(this, 'shape', newShape);
      return newShape;
    },
    type: schema.type,
  });

  return clone(schema, { ...def, type: schema.type });
}
