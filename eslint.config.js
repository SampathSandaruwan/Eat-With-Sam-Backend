const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const eslintPluginImport = require('eslint-plugin-import');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.config.js',
      '*.config.ts',
      'coverage/',
      '*.d.ts',
      '*.d.ts.map',
      '*.js.map',
      'documentation/',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'import': eslintPluginImport,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...eslintPluginImport.configs.recommended.rules,
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',


      // General ESLint rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // Using TypeScript version instead
      'no-undef': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      'no-irregular-whitespace': 'error',
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      'no-unexpected-multiline': 'error',
      'prefer-template': 'warn',
      'prefer-const': 'error',
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'computed-property-spacing': ['warn', 'never'],
      'space-before-blocks': 'warn',
      'keyword-spacing': 'warn',
      'space-infix-ops': 'warn',
      'eol-last': 'warn',
      'indent': ['warn', 2, { SwitchCase: 1 }],

      // Import rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            ['^\\u0000'],
            // Node.js built-in modules
            ['^node:'],
            // External packages (npm packages)
            ['^[a-z]'],
            // Internal imports (relative imports)
            ['^./'],
            ['^../'],
            ['^../../'],
            ['^../../../'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/order': 'off', // Using simple-import-sort instead
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
