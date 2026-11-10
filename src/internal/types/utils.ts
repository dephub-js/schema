import type { SomeSchema } from '#internal/types/schema.ts';
import type {
  DEF_TYPE,
  INPUT_TYPE,
  OUTPUT_TYPE,
} from '#internal/utils/symbols.ts';

export type DistributeSchema<T> = T extends unknown ? SomeSchema<T, T> : never;

export type Exactly<T, X> = Record<Exclude<keyof X, keyof T>, never> & T;

export type Flatten<T> = Identity<{
  [k in keyof T]: T[k];
}>;

export type Identity<T> = T;

export type InexactPartial<T> = {
  [P in keyof T]?: T[P] | undefined;
};

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type MakePartial<T, K extends keyof T> = InexactPartial<Pick<T, K>> &
  Omit<T, K>;

export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type MaybeAsync<T> = Promise<T> | T;

export type NoUndefined<T> = T extends undefined ? never : T;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Ref<T extends 'DEF' | 'INPUT' | 'OUTPUT'> = {
  DEF: typeof DEF_TYPE;
  INPUT: typeof INPUT_TYPE;
  OUTPUT: typeof OUTPUT_TYPE;
}[T];

export type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
} & {};
