// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },

  // base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      parser: tseslint.parser,      // Fix unsafe decorator calls
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: ['./tsconfig.json'], // Ensure correct type checking
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Custom rules
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      '@typescript-eslint/no-unsafe-call': 'warn', 
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
);
