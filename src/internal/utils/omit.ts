import type { ObjectSchema } from '#/core/structural/object.ts';
import type { Mask, ObjectShape } from '#internal/types/index.ts';

import { clone } from '#/core/utilities/clone.ts';
import { mergeDefs } from '#internal/utils/def.ts';
import { assignProp } from '#internal/utils/prop.ts';
import { SCHEMA_DEF } from '#internal/utils/symbols.ts';

export function _omit<
  TShape extends Partial<ObjectShape>,
  M extends Mask<keyof TShape>,
>(schema: ObjectSchema<ObjectShape>, mask: M): ObjectSchema<ObjectShape> {
  const currDef = schema[SCHEMA_DEF];
  const { checks } = currDef;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(
      '.omit() cannot be used on object schemas containing refinements',
    );
  }
  const def = mergeDefs(schema[SCHEMA_DEF], {
    checks: [],
    get shape() {
      const newShape = { ...schema[SCHEMA_DEF].shape };
      for (const key in mask) {
        if (!(key in (currDef.shape ?? {}))) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key]) continue;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete newShape[key];
      }
      assignProp(this, 'shape', newShape);
      return newShape;
    },
    type: schema.type,
  });

  return clone(schema, { ...def, type: schema.type });
}
