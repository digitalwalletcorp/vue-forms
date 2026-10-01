import { computed, inject, provide, reactive, toValue } from 'vue';
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ErrorItem, ValidationError } from '@/validation';

/**
 * エラーオブザーバをprovide/injectするためのキー
 * アプリはこのキーでエラーオブザーバをprovideし、入力コンポーネントはこのキーでinjectする
 */
export const errorObserverKey: InjectionKey<ValidationError> = Symbol('dwui-error-observer');

/**
 * エラーオブザーバを作り、配下のコンポーネントへprovideする
 * 画面のsetupで呼び、返り値をdoValidateに渡す
 *
 * @returns {ValidationError} エラーオブザーバ
 */
export function useErrorObserver(): ValidationError {
  const errorObserver = reactive<ValidationError>({});
  provide(errorObserverKey, errorObserver);
  return errorObserver;
}

/**
 * 指定したキー項目のエラーの有無と、ツールチップ表示用の文字列を返す
 * provideされたエラーオブザーバをinjectするため、コンポーネントのsetupで呼ぶこと
 *
 * @param {MaybeRefOrGetter<string | undefined>} key バリデーションルールのキー
 * @param {MaybeRefOrGetter<number | undefined>} [index] インデックス番号
 * @returns {{ hasError: ComputedRef<boolean>; message: ComputedRef<string> }}
 */
export function useInputError(
  key: MaybeRefOrGetter<string | undefined>,
  index?: MaybeRefOrGetter<number | undefined>
): { hasError: ComputedRef<boolean>; message: ComputedRef<string> } {
  const errorObserver = inject(errorObserverKey, undefined);
  const { t } = useI18n();
  return {
    hasError: computed(() => hasInputError(errorObserver, toValue(key), toValue(index))),
    message: computed(() => buildTooltip(t, errorObserver, toValue(key), toValue(index)))
  };
}

/**
 * 指定したキー項目に入力エラーが発生しているかを返す
 *
 * @param {ValidationError | undefined} errorObserver バリデーションエラーのセット
 * @param {string | undefined} key バリデーションルールのキー
 * @param {number} [index] インデックス番号
 * @returns {boolean} 指定したキー項目にエラーが発生している場合 true
 */
export function hasInputError(errorObserver: ValidationError | undefined, key: string | undefined, index?: number): boolean {
  return 0 < findErrorItems(errorObserver, key, index).length;
}

/**
 * 指定したキー項目に該当するエラーのツールチップ表示用の文字列を返す
 * メッセージの翻訳にuseI18n()を使うため、コンポーネントの描画中に呼ぶこと
 *
 * @param {ValidationError | undefined} errorObserver バリデーションエラーのセット
 * @param {string | undefined} key バリデーションルールのキー
 * @param {number} [index=0] インデックス番号
 * @returns {string} ツールチップ表示用の文字列
 */
export function tooltip(errorObserver: ValidationError | undefined, key: string | undefined, index?: number): string {
  if (findErrorItems(errorObserver, key, index).length === 0) {
    return '';
  }
  const { t } = useI18n();
  return buildTooltip(t, errorObserver, key, index);
}

/**
 * 指定したキー項目のエラーアイテムを返す。無ければ空配列
 *
 * @param {ValidationError | undefined} errorObserver
 * @param {string | undefined} key
 * @param {number} [index]
 * @returns {ErrorItem[]}
 */
function findErrorItems(errorObserver: ValidationError | undefined, key: string | undefined, index?: number): ErrorItem[] {
  if (!errorObserver || !key) {
    return [];
  }
  return errorObserver[key] ?? (index != null ? errorObserver[`${key}[${index}]`] : undefined) ?? [];
}

/**
 * エラーアイテムを翻訳し、', 'で連結した文字列を返す
 *
 * @param {(key: string, params?: unknown[]) => string} t 翻訳関数
 * @param {ValidationError | undefined} errorObserver
 * @param {string | undefined} key
 * @param {number} [index]
 * @returns {string}
 */
function buildTooltip(t: (key: string, params?: unknown[]) => string, errorObserver: ValidationError | undefined, key: string | undefined, index?: number): string {
  const messages: string[] = [];
  for (const errorItem of findErrorItems(errorObserver, key, index)) {
    const bindParams = (errorItem.bind ?? []).map(bind => {
      if (Array.isArray(bind)) {
        return t(bind[index ?? 0]);
      }
      if (bind === '$index') {
        return String((index ?? 0) + 1);
      }
      return t(bind);
    });
    messages.push(t(errorItem.code, bindParams));
  }
  return messages.join(', ');
}
