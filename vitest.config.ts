// eslint-disable-next-line spaced-comment
/// <reference types='vitest' />
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // vite-tsconfig-pathsは.vueからのimportを解決しないため、srcへのaliasは明示する
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  plugins: [tsconfigPaths(), vue()],
  test: {
    // このプロジェクトはvueコンポーネントを含むため、テスト環境はDOM(happy-dom)にする
    environment: 'happy-dom',
    include: [
      'test/specs/**/*.spec.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: [
        'lcov',
        'text-summary'
      ],
      reportsDirectory: 'test/coverage',
      include: [
        'src/**'
      ]
    }
  }
});
