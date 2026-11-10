import type {
  InfertObjectOutput,
  Literal,
  ObjectShape,
  SchemaIssue,
} from '#internal/types/index.ts';

import { isBigInt } from '#internal/is/bigint.ts';

export function format(data: unknown, literal = false): Literal {
  if (literal) {
    if (isBigInt(data)) {
      return `${data}n`;
    }
    return data as Literal;
  }

  if (Array.isArray(data)) return 'array';
  return typeof data;
}

export function prefixCatchallIssues<TShape extends ObjectShape>(opt: {
  input: InfertObjectOutput<TShape>;
  issues: SchemaIssue[];
  shape: ObjectShape;
  unexpectedKey: string;
}): Array<Partial<SchemaIssue>> {
  function quoteJoin(items: string[]) {
    return items.map((k) => `'${k.replace(/'/g, "''")}'`).join(', ');
  }

  return opt.issues.map((issue) => ({
    ...issue,
    code: 'unrecognized_keys',
    expected: quoteJoin(Object.keys(opt.shape)),
    path: [opt.unexpectedKey, ...issue.path],
    received: quoteJoin(Object.keys(opt.input)),
  }));
}

export function prefixIssues(issues: SchemaIssue[], ___: number | string) {
  return issues.map((issue) => ({
    ...issue,
    path: [___, ...issue.path],
  }));
}

export function prefixRecordIssues(
  key: PropertyKey,
  issues: Array<SchemaIssue>,
): Array<Partial<SchemaIssue>> {
  return issues.map((issue) => ({
    ...issue,
    path: [key, ...issue.path],
  }));
}

export function prefixUnrecognizedIssue(
  received: unknown,
  unrecognized: string[],
  message?: string,
): Partial<SchemaIssue> {
  return {
    code: 'unrecognized_keys',
    message: message ?? `Unrecognized keys: ${unrecognized.join(', ')}`,
    path: unrecognized,
    received,
  };
}
