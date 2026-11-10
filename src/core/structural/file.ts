import type { FileDef, SchemaKind } from '#internal/types/index.ts';

import { Schema } from '#/core/utilities/schema.ts';
import { isFile } from '#internal/is/file.ts';
import { SCHEMA_ASSERT, SCHEMA_PARSE } from '#internal/utils/symbols.ts';

/** Schema for validating File objects. */
export class FileSchema extends Schema<File> {
  public override readonly kind: SchemaKind = 'FileSchema';

  constructor(def: FileDef) {
    super(def);
  }

  override [SCHEMA_PARSE](data: unknown): File {
    return this[SCHEMA_ASSERT](isFile(data), {
      expected: 'file',
      received: data,
    });
  }
}

/**
 * Creates a file schema.
 *
 * @param message - Optional error message.
 * @returns File schema.
 *
 * @example
 * const schema = s.file();
 */
export function file(): FileSchema;
export function file(message?: string): FileSchema;
export function file(message?: string): FileSchema {
  return new FileSchema({ message, type: 'file' });
}
