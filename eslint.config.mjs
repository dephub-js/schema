import tsConfig from '@dephub/eslint-ts';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...tsConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'no-await-in-loop': 'off',
      'no-param-reassign': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-unsafe-regex': 'off',
    },
  },
]);
