import type { DistributeSchema, Ref } from '#internal/types/utils.ts';

import type { Literal } from './literal.ts';
import type { InternalSchemaDef, SchemaDef, SomeSchema } from './schema.ts';

export type InternalTemplateDef<Template extends string = string> =
  InternalSchemaDef<Template> & TemplateDef<Template>;

export type PartsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
  [] extends Parts
    ? ``
    : Parts extends [...infer Rest, infer Last extends TemplateLiteralPart]
      ? Rest extends TemplateLiteralPart[]
        ? AppendToTemplateLiteral<PartsToTemplateLiteral<Rest>, Last>
        : never
      : never;

export interface TemplateDef<
  Template extends string = string,
> extends SchemaDef<Template> {
  format?: string | undefined;
  parts: TemplateLiteralPart[];
  type: 'template_literal';
}

export type TemplateLiteralPart = DistributeSchema<Literal> | Literal;

type AppendToTemplateLiteral<
  Template extends string,
  Suffix extends Literal | SomeSchema,
> = Suffix extends Literal
  ? `${Template}${UndefinedToEmptyString<Suffix>}`
  : Suffix extends SomeSchema
    ? `${Template}${Suffix[Ref<'OUTPUT'>] extends infer T extends Literal
        ? UndefinedToEmptyString<T>
        : never}`
    : never;

type UndefinedToEmptyString<T> = T extends undefined ? '' : T;
