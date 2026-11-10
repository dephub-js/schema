import type {
  ExtendedDef,
  ObjectShape,
  SomeSchema,
} from '#internal/types/index.ts';

export function assignProp(
  target: ExtendedDef<SomeSchema>,
  prop: string,
  value: ObjectShape,
) {
  Object.defineProperty(target, prop, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}
