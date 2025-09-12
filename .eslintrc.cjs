module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: "Literal[value=/^#[0-9A-Fa-f]{3,6}$/]",
            message: 'Avoid hard-coded hex colors; use design tokens.',
          },
        ],
      },
    },
  ],
};
