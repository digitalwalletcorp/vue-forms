import { fileURLToPath } from 'node:url';
import { defineNuxtConfig } from 'nuxt/config';

/** 利用者と同じ経路で、ビルド済みのNuxtモジュール(lib/nuxt.js)を読み込む */
export default defineNuxtConfig({
  modules: [fileURLToPath(new URL('../../../lib/nuxt.js', import.meta.url))],
  compatibilityDate: '2025-01-01'
});
