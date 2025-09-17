/* ESLint configuration enforcing strict typing while allowing legacy boundary exceptions */
module.exports = {
  root: true,
  env: { es2022: true, browser: true, node: true },
  overrides: [
    // TypeScript files strict rules
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
        '@typescript-eslint/ban-ts-comment': 'warn'
      }
    },
    // Relax legacy / DSL / migration JS files
    {
      files: [
        '**/*.js'
      ],
      extends: ['eslint:recommended'],
      rules: {
        // disable TS specific expectations on JS
        'no-fallthrough': 'warn'
      }
    },
    {
      files: [
        'src/domain/promotions/dsl/**',
        'src/infrastructure/db/migrations/**',
        'scripts/**'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      // Broader legacy service + repository layer still being migrated → allow any for now
      files: [
        'src/application/services/**/*.{ts,tsx}',
        'src/infrastructure/repositories/**/*.{ts,tsx}'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  ignorePatterns: ["**/*.js"],
};
