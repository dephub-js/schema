import { isNan } from './nan.ts';

export function isDate(data: unknown): data is Date {
  return data instanceof Date && !isNan(data.getTime());
}
