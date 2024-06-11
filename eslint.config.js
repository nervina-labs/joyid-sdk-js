import loveConfig from 'eslint-config-love'
import prettierConfig from 'eslint-plugin-prettier/recommended'

import tseslint from 'typescript-eslint'

export default tseslint.config(
  loveConfig,
  prettierConfig,
  {
    ignores: [
      'dist/',
      'coverage/',
      'public/',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'packages/bitcoin/dist/**/*',
      'packages/ckb/dist/**/*',
      'packages/evm/dist/**/*',
      'packages/common/dist/**/*',
      'packages/ethereum-provider/dist/**/*',
      'packages/ethers/dist/**/*',
      'packages/nostr/dist/**/*',
      'packages/rainbowkit/dist/**/*',
      'packages/wagmi/dist/**/*',
      'packages/miniapp/dist/**/*',
      'examples/bitcoin-demo/dist/**/*',
      'examples/ckb-demo/dist/**/*',
      'examples/evm-demo/dist/**/*',
      'examples/rainbowkit-demo/dist/**/*',
      'examples/wagmi-demo/dist/**/*',
    ],
  },
  {
    // languageOptions: {
    //   parserOptions: {
    //     project: true,
    //   },
    // },
    rules: {
      'no-return-await': 'off',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['examples/**/*'],
    rules: {
      'no-return-await': 'off',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  }
)
