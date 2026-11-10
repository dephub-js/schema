import type {
  FORMAT_CHECK_PUSHED,
  JWT_CHECK_PUSHED,
  URL_CHECK_PUSHED,
} from '#internal/utils/symbols.ts';

import type { InternalSchemaDef, SchemaDef } from './schema.ts';

export interface Base64Def extends StringDef {
  format: 'base64';
  pattern?: RegExp;
  type: 'string';
}

export interface Base64URLDef extends StringDef {
  format: 'base64url';
  pattern?: RegExp;
  type: 'string';
}

export interface CIDRv4Def extends StringDef {
  format: 'cidrv4';
  pattern?: RegExp;
  type: 'string';
}

export interface CIDRv6Def extends StringDef {
  format: 'cidrv6';
  pattern?: RegExp;
  type: 'string';
}

export interface CUID2Def extends StringDef {
  format: 'cuid2';
  pattern?: RegExp;
  type: 'string';
}

export interface CUIDDef extends StringDef {
  format: 'cuid';
  pattern?: RegExp;
  type: 'string';
}

export interface E164Def extends StringDef {
  format: 'e164';
  pattern?: RegExp;
  type: 'string';
}

export interface EmailDef extends StringDef {
  format: 'email';
  pattern?: RegExp;
  type: 'string';
}

export interface EmojiDef extends StringDef {
  format: 'emoji';
  pattern?: RegExp;
  type: 'string';
}

export interface GUIDDef extends StringDef {
  format: 'guid';
  pattern?: RegExp;
  type: 'string';
}

export interface InternalJWTDef extends InternalStringDef {
  [JWT_CHECK_PUSHED]?: true;
}

export type InternalStringDef = InternalSchemaDef<string> &
  StringDef & {
    format: StringFormats;
    maximum?: number;
    minimum?: number;
    pattern: RegExp;
    patterns: Set<RegExp>;
  };

export interface InternalStringFormatDef extends InternalStringDef {
  [FORMAT_CHECK_PUSHED]?: true;
}

export interface InternalURLDef extends InternalStringDef {
  [URL_CHECK_PUSHED]?: true;
}

export interface IPv4Def extends StringDef {
  format: 'ipv4';
  pattern?: RegExp;
  type: 'string';
}

export interface IPv6Def extends StringDef {
  format: 'ipv6';
  pattern?: RegExp;
  type: 'string';
}

export interface ISODateDef extends StringDef {
  format: 'date';
  pattern?: RegExp;
  type: 'string';
}

export interface ISODateTimeDef extends StringDef {
  format: 'datetime';
  local: boolean;
  offset: boolean;
  pattern?: RegExp;
  precision: null | number;
  type: 'string';
}

export interface ISODurationDef extends StringDef {
  format: 'duration';
  pattern?: RegExp;
  type: 'string';
}

export interface ISOTimeDef extends StringDef {
  format: 'time';
  pattern?: RegExp;
  precision?: null | number;
  type: 'string';
}

export interface JWTDef extends StringDef {
  alg?:
    | 'EdDSA'
    | 'ES256'
    | 'ES384'
    | 'ES512'
    | 'HS256'
    | 'HS384'
    | 'HS512'
    | 'PS256'
    | 'PS384'
    | 'PS512'
    | 'RS256'
    | 'RS384'
    | 'RS512'
    | (string & {});
  format: 'jwt';
  pattern?: RegExp;
  type: 'string';
}

export interface KSUIDDef extends StringDef {
  format: 'ksuid';
  pattern?: RegExp;
  type: 'string';
}

export interface NanoIDDef extends StringDef {
  format: 'nanoid';
  pattern?: RegExp;
  type: 'string';
}

export interface StringDef extends SchemaDef<string> {
  coerce?: boolean;
  type: 'string';
}

export interface StringFormatDef extends SchemaDef<string> {
  format: StringFormats;
  pattern?: RegExp;
  type: 'string';
}

export type StringFormats =
  | 'base64'
  | 'base64url'
  | 'cidrv4'
  | 'cidrv6'
  | 'cuid2'
  | 'cuid'
  | 'date'
  | 'datetime'
  | 'duration'
  | 'e164'
  | 'email'
  | 'emoji'
  | 'ends_with'
  | 'guid'
  | 'includes'
  | 'ipv4'
  | 'ipv6'
  | 'json_string'
  | 'jwt'
  | 'ksuid'
  | 'lowercase'
  | 'nanoid'
  | 'regex'
  | 'starts_with'
  | 'tel'
  | 'time'
  | 'ulid'
  | 'uppercase'
  | 'url'
  | 'uuid'
  | 'xid';

export interface TelDef extends StringDef {
  format: 'tel';
  pattern?: RegExp;
  type: 'string';
}

export interface ULIDDef extends StringDef {
  format: 'ulid';
  pattern?: RegExp;
  type: 'string';
}
export interface UrlDef extends StringDef {
  format: 'url';
  hostname?: RegExp;
  normalize?: boolean;
  protocol?: RegExp;
  type: 'string';
}

export interface UUIDDef extends StringDef {
  format: 'uuid';
  pattern?: RegExp;
  type: 'string';
  version?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8';
}

export interface XIDDef extends StringDef {
  format: 'xid';
  pattern?: RegExp;
  type: 'string';
}
