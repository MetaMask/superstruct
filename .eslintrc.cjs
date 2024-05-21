module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        'import/no-useless-path-segments': ['error', { noUselessIndex: false }],
      }
    },

    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: [
        '@metamask/eslint-config-jest',
        '@metamask/eslint-config-nodejs',
      ],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          {
            allow: ['describe', 'it'],
          },
        ],
      },
    },
  ],

  ignorePatterns: [
    '!.eslintrc.cjs',
    '!.prettierrc.cjs',
    'dist/',
    'docs/',
    '.yarn/',
    'examples/',
  ],
};
