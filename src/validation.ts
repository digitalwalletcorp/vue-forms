import { VueFormsError } from '@/errors';

export interface ValidationRule {
  /** バリデーションルール */
  rule: boolean | boolean[];
  /** エラー発生項目のキー */
  key?: string | string[];
  /** エラー時のメッセージコード */
  code: string;
  /** バインドパラメータ */
  bind?: any[];
  /** 条件（validを指定すると条件が正常を示すようになる） */
  condition?: 'valid' | 'invalid';
  /** ルールID */
  ruleId?: string;
  /** 前提条件となるルールIDの配列 */
  prerequisite?: string | string[];
}

export interface ValidationError {
  /** 項目名： エラーアイテム配列 */
  [key: string]: ErrorItem[];
}

export interface ErrorItem {
  /** エラー発生項目のキー */
  key?: string;
  /** エラーコード */
  code: string;
  /** バインドパラメータ */
  bind?: any[];
  /** ルールID */
  ruleId?: string;
}

/**
 * バリデーションチェックを行う
 *
 * 項目名を省略した場合は、バリデーションマップに含まれる全てのチェックを行う
 * 項目名を指定した場合は、バリデーションマップの項目名に該当するチェックのみ行う
 *
 * @param {ValidationError | undefined} validationError エラーオブザーバ
 * @param {Record<string, ValidationRule[]>} validationRules バリデーションルール
 * @param {string | string[]} [items] 項目名
 * @param {number} [index] インデックス番号。指定すると、ruleがbooleanのルールのエラーを `key[index]` に格納する。特定の行だけをチェックするときに使う
 * @returns 全てのバリデーションチェックが正常だった場合 true
 */
export function doValidate(
  validationError: ValidationError | undefined,
  validationRules: Record<string, ValidationRule[]>,
  items?: string | string[],
  index?: number
): boolean {
  if (!validationError) {
    throw new VueFormsError('Function doValidate has been called but no referrence for validation error observer found.');
  }
  const targetKeys = items
    ? typeof items === 'string'
      ? [items]
      : items
    : Object.keys(validationRules);
  for (const targetKey of targetKeys) {
    for (const errorKey of Object.keys(validationError)) {
      if (errorKey === targetKey || indexedKeyPattern(targetKey).test(errorKey)) {
        delete validationError[errorKey];
      }
    }
  }
  for (const key of targetKeys) {
    if (!Object.hasOwn(validationRules, key)) {
      throw new VueFormsError(`key '${key}' not exists in validationRules`, {
        cause: validationRules
      });
    }
    for (const rules of validationRules[key]) {
      if (Array.isArray(rules.rule)) {
        // boolean[] の場合
        for (const index of rules.rule.keys()) {
          validateChunk(validationError, key, rules, index);
        }
      } else {
        // boolean の場合
        validateChunk(validationError, key, rules, index);
      }
    }
  }
  return !containsError(validationError, targetKeys);
}

/**
 * ルール個別のチェックを行う
 *
 * @param {ValidationError} errors バリデーションエラー
 * @param {string} key キー
 * @param {ValidationRule} rules バリデーションルール
 * @param {number} [index] インデックス番号
 */
export function validateChunk(errors: ValidationError, key: string, rules: ValidationRule, index?: number): void {
  const indexedKey = index != null ? `${key}[${index}]` : key;
  if (Object.keys(errors).length && rules.prerequisite) {
    // チェック前提条件が設定されている場合
    const hasRuleError = (errorItems: ErrorItem[] | undefined, ruleId: string): boolean => {
      return !!errorItems?.some(item => item.ruleId === ruleId);
    };
    const prerequisites = Array.isArray(rules.prerequisite) ? rules.prerequisite : [rules.prerequisite];
    const prerequisite = prerequisites.find(pre => {
      if (pre.includes('.')) {
        // 前提条件に . を含む場合 => 別のkeyのエラーを対象とする
        // 行のチェックでは同じ行のエラーを探す。ヘッダ項目のような行を持たないkeyも前提にできるよう、添字の無いkeyのエラーも探す
        const [preKey, preRuleId] = pre.split('.');
        return (index != null && hasRuleError(errors[`${preKey}[${index}]`], `${preRuleId}[${index}]`))
          || hasRuleError(errors[preKey], preRuleId);
      }
      // 前提条件に . を含まない場合 => このkeyのみを対象とする
      return hasRuleError(errors[indexedKey], index != null ? `${pre}[${index}]` : pre);
    });
    if (prerequisite != null) {
      return;
    }
  }
  const rule = Array.isArray(rules.rule) ? rules.rule[index || 0] : rules.rule;
  if (rules.condition === 'valid'
    ? rule === false
    : rule === true
  ) {
    const errorItems = errors[indexedKey] || [];
    const errorItem = {
      key: Array.isArray(rules.key) ? rules.key[index || 0] : rules.key,
      code: rules.code,
      bind: rules.bind,
      ruleId: rules.ruleId && (index != null || Array.isArray(rules.rule))
        ? `${rules.ruleId}[${index || 0}]`
        : rules.ruleId
    } as ErrorItem;
    errorItems.push(errorItem);
    errors[indexedKey] = errorItems;
  }
}

/**
 * バリデーションエラーが含まれているか判定する
 *
 * @param {ValidationError} validationError バリデーションエラー
 * @param {string[]} keys 対象キー
 * @returns {boolean}
 */
export function containsError(validationError: ValidationError, keys: string[]): boolean {
  return !!keys.find(a => Object.keys(validationError).find(b => b === a || indexedKeyPattern(a).test(b)));
}

/**
 * errorObserver内から指定したキーのエラー情報のみ抽出する
 *
 * @param {ValidationError | undefined} errorObserver
 * @param {string[]} [keys]
 * @returns {ValidationError}
 */
export function extractErrors(errorObserver: ValidationError | undefined, keys?: string[]): ValidationError {
  if (!errorObserver) {
    return {} as ValidationError;
  }
  return Object.entries(errorObserver).reduce((acc, [key, errorItems]) => {
    if (!keys || keys.includes(key)) {
      acc[key] = errorItems;
    }
    return acc;
  }, {} as ValidationError);
}

/**
 * errorObserver内から指定したキーのエラー情報をクリアする
 *
 * @param {ValidationError | undefined} errorObserver
 * @param {string[]} [keys]
 */
export function clearErrors(errorObserver: ValidationError | undefined, keys?: string | RegExp | (string | RegExp)[]): void {
  if (!errorObserver) {
    return;
  }
  if (keys) {
    if (Array.isArray(keys)) {
      for (const key of keys) {
        if (typeof key === 'string') {
          delete errorObserver[key];
        } else {
          Object.keys(errorObserver).filter(k => k.match(key)).forEach(a => delete errorObserver[a]);
        }
      }
    } else {
      if (typeof keys === 'string') {
        delete errorObserver[keys];
      } else {
        Object.keys(errorObserver).filter(k => k.match(keys)).forEach(a => delete errorObserver[a]);
      }
    }
  } else {
    for (const key of Object.keys(errorObserver)) {
      delete errorObserver[key];
    }
  }
}

/**
 * キーに添字を付けたエラーキー(`key[0]`など)に一致する正規表現を返す
 * キーに正規表現の特殊文字が含まれても文字どおりに一致させるため、エスケープしてから組み立てる
 *
 * @param {string} key キー
 * @returns {RegExp}
 */
function indexedKeyPattern(key: string): RegExp {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedKey}\\[\\d+\\]$`);
}
