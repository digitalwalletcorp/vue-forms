import type { InjectionKey } from 'vue';

/** DatePickerに表示する祝日 */
export type InputDateHoliday = {
  /** yyyy-MM-dd */
  date: string;
  /** 祝日の名前。日付にマウスを重ねると表示する */
  name: string;
  /** 地域の祝日 */
  regional?: boolean;
};

/** InputDateのアプリ既定の設定。InputDateのpropsに同じ名前の指定があればそちらが優先される */
export type InputDateOptions = {
  /** 指定した年月の祝日を返す。未指定なら祝日を表示しない */
  fetchHolidays?: (year: number, month: number) => Promise<InputDateHoliday[]>;
  /** 「今日」の基準にするIANAのタイムゾーン名。未指定ならブラウザのローカル時刻 */
  timezone?: string;
};

/**
 * InputDateのアプリ既定の設定をprovide/injectするためのキー
 * provideは任意。アプリ全体の既定値を渡すときに、画面の上位またはapp.provideで使う
 */
export const inputDateOptionsKey: InjectionKey<InputDateOptions> = Symbol('dwui-input-date-options');
