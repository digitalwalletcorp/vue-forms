import { getCurrentInstance, onMounted, watch } from 'vue';
import type { ComponentInternalInstance, Ref } from 'vue';

/** 記憶した値をまとめて保存するlocalStorageのキー */
const STORAGE_KEY = 'dwui-memorized-form-value';

/**
 * 記憶した値をすべて読み込む
 * プライベートモードなどでlocalStorageを使えない場合や、保存内容が壊れている場合は空として扱う
 *
 * @returns {Record<string, unknown>}
 */
function readMemorizedValues(): Record<string, unknown> {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

/**
 * 記憶した値をすべて保存する
 * 保存に失敗しても画面の動作は止めない
 *
 * @param {Record<string, unknown>} values
 */
function writeMemorizedValues(values: Record<string, unknown>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // fall-through
  }
}

/**
 * 呼び出したコンポーネントが、どの画面のどこに置かれているかを表す文字列を返す
 *
 * - 画面: vue-routerのルート定義(/detail/:id など)。実際のパスにするとパラメータごとに別の記憶になるため定義を使う。
 *   vue-routerを依存に加えないよう、アプリに登録された$routeから読む。ルーターが無いアプリではundefinedにする
 * - 置き場所: 呼び出したコンポーネントから親へたどった__nameの並び。
 *   レイアウトから描画される部品はルート定義が同じになるため、部品の名前で区別する。
 *   __fileは開発時にしか付かないため使えないが、__nameは本番のビルドにも残るのでこれを使ってスコープ文字列を生成
 *
 * @param {ComponentInternalInstance} instance 呼び出したコンポーネント
 * @returns {string}
 */
function resolveScope(instance: ComponentInternalInstance): string {
  const route = instance.appContext.config.globalProperties.$route as { matched?: { path: string }[] } | undefined;
  const routePath = route?.matched?.at(-1)?.path;
  const names: (string | undefined)[] = [];
  for (let current: ComponentInternalInstance | null = instance; current != null; current = current.parent) {
    const type = current.type as { __name?: string; name?: string };
    names.push(type.__name ?? type.name);
  }
  return `${routePath}|${names.join('<')}`;
}

/**
 * 入力値をlocalStorageに記憶し、次に表示したときに復元する
 * 画面のsetupで、値を使う他のonMountedより前に呼ぶ
 *
 * - 記憶は、呼び出したコンポーネントの画面・置き場所とkeyの組み合わせで分かれる
 * - 表示時(onMounted)に記憶した値があれば、sourceへ戻す
 * - 以後はsourceが変わるたびに保存する
 * - サーバー側の描画(SSR)ではonMountedが実行されないため、何もしない
 * - setupの外で呼ばれた場合は、警告を出して何もしない。記憶されないまま黙って動くのを避けるため、本番でも警告を出す
 *
 * @param {string} key 記憶のキー。呼び出したコンポーネントの中で一意になるように付ける
 * @param {Ref<T>} source 記憶する値。reactiveなオブジェクトのプロパティはtoRefで渡す
 */
export function useMemorizedValue<T>(key: string, source: Ref<T>): void {
  const instance = getCurrentInstance();
  if (!instance) {
    console.warn('[vue-forms] useMemorizedValue must be called in setup. The value is not memorized.');
    return;
  }
  const storageKey = `${resolveScope(instance)}|${key}`;
  onMounted(() => {
    const values = readMemorizedValues();
    if (storageKey in values) {
      source.value = values[storageKey] as T;
    }
    // 復元した値を保存し直さないよう、復元の後で監視を始める
    watch(source, (newValue: T) => {
      const latestValues = readMemorizedValues();
      latestValues[storageKey] = newValue;
      writeMemorizedValues(latestValues);
    }, {
      deep: true
    });
  });
}
