import type { AllowType, LabelText } from '@/types/form';

/** 許容種別リスト */
const allowTypes: Record<string, RegExp> = Object.freeze({
  ascii: /^[ -~]*$/,
  number: /^[\-+]?[0-9]*$/,
  decimal: /^[\-+]?(?:[0-9]*\.?[0-9]*)$/, // 先頭の連続する0許容、.始まり許容、先頭符号許容
  alpha: /^[a-zA-Z]*$/,
  alphanum: /^[0-9a-zA-Z]*$/
});

/**
 * 許容種別にマッチするかチェックする
 *
 * @param {string} value
 * @param {AllowType} allowType
 * @returns
 */
export function checkAllowType(value: string, allowType: AllowType): boolean {
  return allowTypes[allowType].test(value);
}

/**
 * 許容正規表現にマッチするかチェックする
 *
 * @param {string} value
 * @param {string | RegExp | null} allowRegexp
 * @returns
 */
export function checkRegExp(value: string, allowRegexp: string | RegExp | null): boolean {
  if (!allowRegexp) {
    return true;
  }
  const regexp = typeof allowRegexp === 'string'
    ? new RegExp(allowRegexp)
    : allowRegexp;
  return regexp.test(value);
}

/**
 * allow-type, allow-regexpに合致しない文字を取り除いた文字列を返す
 * ユーザー入力補助的な位置付けなので、元の文字列と返却される文字列が必ずしも違和感のないものである保証はない
 * 例えば'decimal'の場合:
 *   123abc456 -> 123456
 *   100.200.300 -> 100.200300
 *
 * @param {string} value
 * @param options
 *   allowType: AllowType
 *   allowRegexp: string | RegExp
 * @returns {string}
 */
export function filterInput(value: string, options: {
  allowType?: AllowType,
  allowRegexp?: string | RegExp
}): string {
  let regexp: RegExp | null = null;
  if (options.allowType) {
    regexp = allowTypes[options.allowType];
  } else if (options.allowRegexp) {
    regexp = new RegExp(options.allowRegexp);
  }
  if (regexp) {
    let filteredValue = '';
    for (let i = 0; i < value.length; i++) {
      filteredValue += value.charAt(i);
      if (!filteredValue.match(regexp)) {
        filteredValue = filteredValue.slice(0, filteredValue.length - 1);
      }
    }
    return filteredValue;
  }
  return value;
}

/**
 * ラベルを表示用の文字列にする。関数の場合は呼び出した結果を返す
 *
 * @param {LabelText} label
 * @returns {string}
 */
export function resolveLabel(label: LabelText): string {
  return typeof label === 'function' ? label() : label;
}
