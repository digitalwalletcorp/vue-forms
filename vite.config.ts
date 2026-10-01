import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

const SRC = fileURLToPath(new URL('./src', import.meta.url));

/**
 * コンポーネントを1つずつエントリにする。
 * 1ファイルにまとめると、1つimportしただけで全コンポーネントがバンドルされてしまう。
 */
const entries: Record<string, string> = {
  index: 'src/index.ts',
  nuxt: 'src/nuxt.ts',
  register: 'src/register.ts'
};
for (const fileName of readdirSync(SRC).filter((name) => name.endsWith('.vue')).sort()) {
  entries[fileName.replace(/\.vue$/, '')] = `src/${fileName}`;
}

/**
 * CJS向けの型定義(.d.cts)を.d.tsから起こす。
 * `type: "module"`のパッケージでは.d.tsがESM扱いになり、CJSのTypeScript利用者(moduleResolution: node16)が
 * requireできない型として弾かれる(TS1479)。.d.cts側では相対importも.cjsへ向ける
 */
const writeCjsDeclarations = () => {
  for (const fileName of readdirSync('lib', { recursive: true }).filter((name) => String(name).endsWith('.d.ts'))) {
    const filePath = join('lib', String(fileName));
    const source = readFileSync(filePath, 'utf8');
    const output = source.replace(/(['"])(\.\.?\/[^'"]+)\1/g, '$1$2.cjs$1');
    writeFileSync(filePath.replace(/\.d\.ts$/, '.d.cts'), output);
  }
};

/**
 * グローバル型定義をlibに出力する。
 * src/types/からlib/直下へ置き場所が変わるため、相対参照を付け替える
 */
const copyStaticFiles = {
  name: 'copy-static-files',
  writeBundle() {
    const source = readFileSync('src/types/global.d.ts', 'utf8');
    const output = source.replace(`import('../components')`, `import('./components')`);
    // 付け替え漏れは利用側で型が壊れるだけで気づきにくいため、ビルドを止める
    if (output === source) {
      throw new Error(`src/types/global.d.ts: import('../components') not found`);
    }
    writeFileSync('lib/global.d.ts', output);
  }
};

export default defineConfig({
  // tsconfigのpathsはビルドに効かないため、同じ対応をここでも与える
  resolve: {
    alias: { '@': SRC }
  },
  plugins: [
    vue(),
    // 型定義は`.vue`から起こす。`defineProps<Props>()`のリテラル型とJSDocを保つため
    dts({
      include: ['src'],
      outDirs: ['lib'],
      // 出力側は`.vue`を落とした名前なので、型定義のファイル名と参照も合わせる
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace(/\.vue\.d\.ts$/, '.d.ts'),
        content: content.replace(/(from\s+['"][^'"]+)\.vue(['"])/g, '$1$2')
      }),
      afterBuild: writeCjsDeclarations
    }),
    copyStaticFiles
  ],
  build: {
    outDir: 'lib',
    // 出力する構文を固定する。バンドラの既定値に引きずられないように
    target: 'es2022',
    emptyOutDir: true,
    // SFCの<style>はlib/style.cssの1ファイルにまとめる。利用側が明示的に読み込む
    cssCodeSplit: false,
    lib: { entry: entries, cssFileName: 'style' },
    rollupOptions: {
      external: [
        'vue',
        '@nuxt/kit',
        // peerDependenciesのため利用側でインストールしたものを使う。
        // バンドルに含めると利用側と二重になり、i18nのインスタンスやfloating-vueの設定が共有されない
        'vue-i18n',
        'floating-vue',
        /^@digitalwalletcorp\/utils(\/.*)?$/,
        /^@digitalwalletcorp\/vue-svg-icons(\/.*)?$/
      ],
      output: [
        { format: 'es', entryFileNames: '[name].js' },
        { format: 'cjs', entryFileNames: '[name].cjs', exports: 'named' }
      ]
    }
  }
});
