/** 許容種別 */
export type AllowType = 'number' | 'ascii' | 'decimal' | 'alpha' | 'alphanum';

// Formのモデルが動的に変わる場合の型定義(SelectBoxなど)
export type StringModelType = string;
export type NumberModelType = number | null;
export type BooleanModelType = boolean | null;

/** 選択肢などのラベル。言語の切り替えに追従させる場合は文字列を返す関数で渡す */
export type LabelText = string | (() => string);

/** ラベル/バリューペア */
export type ValueLabelPair<V = any, L = LabelText> = {
  value: V;
  label: L;
  disabled?: boolean;
  visible?: boolean; // ドロップダウンで表示するかどうか。省略時は表示する（true相当）とみなす
  optGroup?: string;
  children?: ValueLabelPair<V, L>[];
};
export type GroupValueLabelPair<V = any, L = LabelText> = {
  optGroup: string;
  children: ValueLabelPair<V, L>[];
  disabled?: boolean;
  visible?: boolean; // ドロップダウンで表示するかどうか。省略時は表示する（true相当）とみなす
};

/** MultiSelectBoxの選択リストのボタンの文言。未指定のボタンは英語の既定の文言になる */
export type MultiSelectBoxButtonLabels = {
  ok?: string;
  selectAll?: string;
  clear?: string;
  close?: string;
};
