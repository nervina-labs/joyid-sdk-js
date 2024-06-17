import unjs from 'eslint-config-unjs'
import prettierConfig from 'eslint-plugin-prettier/recommended'

export default unjs(
  {
    ignores: ['**/.nuxt', 'dist/**', '**/dist'],
  },
  {
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/filename-case': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'unicorn/expiring-todo-comments': 'off',
    },
  },
  prettierConfig
)
