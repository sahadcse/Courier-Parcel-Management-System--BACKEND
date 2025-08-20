// eslint.config.cjs
const pluginJs = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  // Base JavaScript recommended rules
  {
    ...pluginJs.configs.recommended,
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    // The `tseslint.configs.recommended` already provides the necessary rules and settings.
    // If you need to add custom rules, do so here.
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
  // Prettier integration
    // pluginPrettier.configs.recommended,
    // {
    //   files: ['**/*.ts', '**/*.js'],
    //   rules: {
    //     'prettier/prettier': [
    //       'error',
    //       {
    //         semi: true,
    //         trailingComma: 'es5',
    //         singleQuote: true,
    //         printWidth: 80,
    //         tabWidth: 2,
    //       },
    //     ],
    //   },
    // },
  // Custom project rules and settings
  {
    // The `files` key is not needed if you apply this to all files.
    // However, it's good practice for specificity.
    files: ['**/*.ts'],
    rules: {
      'no-console': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    ignores: ['node_modules', 'dist', 'tests'],
  },
];