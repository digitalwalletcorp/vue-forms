// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { loadNuxt } from 'nuxt';
import type { Component } from '@nuxt/schema';
import * as components from '@/index';

const FIXTURE = fileURLToPath(new URL('../fixtures/nuxt-app', import.meta.url));

describe('nuxt module', () => {
  // Nuxtの起動を伴うため、既定のタイムアウトでは足りない
  it('registers every component as an auto-imported component', async () => {
    const nuxt = await loadNuxt({ cwd: FIXTURE, dev: false });
    try {
      // addComponent()の登録結果は components:extend フックに集まる
      const registered: Component[] = [];
      await nuxt.callHook('components:extend', registered);

      const names = Object.keys(components);
      const ours = registered.filter((component) => names.includes(component.pascalName));
      expect(ours.map((component) => component.pascalName).sort()).toEqual(names.sort());
      // 自動importの解決先が、このパッケージのエントリになっていること
      for (const component of ours) {
        expect(component.filePath).toMatch(/vue-forms[/\\]lib[/\\]index/);
      }
    } finally {
      await nuxt.close();
    }
  }, 120_000);
});
