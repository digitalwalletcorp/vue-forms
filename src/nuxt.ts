import { addComponent, createResolver, defineNuxtModule } from '@nuxt/kit';
import * as components from '@/components';

/**
 * コンポーネントをNuxtのコンポーネント自動importへ登録するモジュール。
 * グローバル登録(registerComponents)と違い、テンプレートで使ったコンポーネントだけがバンドルされ、
 * 型は Nuxt が .nuxt/components.d.ts へ生成するため、利用側に型定義は要らない。
 *
 * 名前の一覧を得るためだけに ./components をimportしている。
 * このモジュールはビルド時にNuxtが読み込むもので、アプリの実行時バンドルには入らない
 */
export default defineNuxtModule({
  meta: {
    name: '@digitalwalletcorp/vue-forms',
    configKey: 'vueForms'
  },
  setup() {
    const resolver = createResolver(import.meta.url);
    for (const name of Object.keys(components)) {
      addComponent({ name, export: name, filePath: resolver.resolve('./index') });
    }
  }
});
