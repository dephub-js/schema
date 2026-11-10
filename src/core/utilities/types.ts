import type { SomeSchema } from '#internal/types/schema.ts';
import type { Ref } from '#internal/types/utils.ts';

/** Infers the output type from a schema. */
export type infer<T extends SomeSchema> = T[Ref<'OUTPUT'>];

/** Extracts the input type from a schema. */
export type input<T extends SomeSchema> = T[Ref<'INPUT'>];

/** Extracts the output type from a schema. */
export type output<T extends SomeSchema> = T[Ref<'OUTPUT'>];
