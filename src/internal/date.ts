/**
 * InputDateとDatePickerで使う日付の計算
 * 値は区切り文字を除いた数字の並び(yyyyMMddHHmmssSSSの一部)で扱う。タイムゾーンの影響を受けないよう、計算はUTCで行う
 */

/** 年月日 */
export type Ymd = {
  year: number;
  /** 1〜12 */
  month: number;
  day: number;
};

/**
 * 月の日数を返す
 *
 * @param {number} year
 * @param {number} month 1〜12
 * @returns {number}
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 区切り文字を除いた書式(yyyyMMdd など)に沿って、値が日付・時刻として正しいかを返す
 * 年を持たない書式(MMdd)では、2月29日を許すため閏年として扱う
 *
 * @param {string} value 区切り文字を除いた値
 * @param {string} plainFormat 区切り文字を除いた書式
 * @returns {boolean}
 */
export function isValidDateValue(value: string, plainFormat: string): boolean {
  if (value.length !== plainFormat.length || !/^\d+$/.test(value)) {
    return false;
  }
  const part = (token: string, fallback: number): number => {
    const index = plainFormat.indexOf(token);
    return index < 0 ? fallback : Number(value.substring(index, index + token.length));
  };
  const year = part('yyyy', 2000);
  const month = part('MM', 1);
  const day = part('dd', 1);
  return 1 <= month && month <= 12
    && 1 <= day && day <= daysInMonth(year, month)
    && part('HH', 0) <= 23
    && part('mm', 0) <= 59
    && part('ss', 0) <= 59;
}

/**
 * 区切り文字を除いた書式に沿って、値から年月日を取り出す。取り出せない場合はnull
 * 年を持たない書式(MMdd)では、今日の年を使う
 *
 * @param {string | null | undefined} value 区切り文字を除いた値
 * @param {string} plainFormat 区切り文字を除いた書式
 * @param {Ymd} today 今日
 * @returns {Ymd | null}
 */
export function toYmd(value: string | null | undefined, plainFormat: string, today: Ymd): Ymd | null {
  if (!value || !isValidDateValue(value, plainFormat) || !plainFormat.includes('MM') || !plainFormat.includes('dd')) {
    return null;
  }
  const part = (token: string): number => {
    const index = plainFormat.indexOf(token);
    return Number(value.substring(index, index + token.length));
  };
  return {
    year: plainFormat.includes('yyyy') ? part('yyyy') : today.year,
    month: part('MM'),
    day: part('dd')
  };
}

/**
 * 今日の年月日を返す
 *
 * @param {string} [timezone] IANAのタイムゾーン名。未指定ならブラウザのローカル時刻
 * @returns {Ymd}
 */
export function today(timezone?: string): Ymd {
  // en-CAはyyyy-MM-ddの形で書式化される
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()).split('-').map(Number);
  return {
    year: year!,
    month: month!,
    day: day!
  };
}

/**
 * 年月日をyyyyMMddの文字列にする
 *
 * @param {Ymd} ymd
 * @returns {string}
 */
export function formatYmd(ymd: Ymd): string {
  return `${String(ymd.year).padStart(4, '0')}${String(ymd.month).padStart(2, '0')}${String(ymd.day).padStart(2, '0')}`;
}

/**
 * 月を移動した年月日を返す。移動先の月に同じ日が無い場合は月末にする
 *
 * @param {Ymd} ymd
 * @param {number} months 移動する月数
 * @returns {Ymd}
 */
export function addMonths(ymd: Ymd, months: number): Ymd {
  const date = new Date(Date.UTC(ymd.year, ymd.month - 1 + months, 1));
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return {
    year,
    month,
    day: Math.min(ymd.day, daysInMonth(year, month))
  };
}

/**
 * カレンダーに並べる42日(6週)を返す
 * 月の初日を含む週の日曜から並べる。初日が日曜の場合は、前の週から並べる
 *
 * @param {number} year
 * @param {number} month 1〜12
 * @returns {{ ymd: Ymd; weekday: number; outOfRange: boolean }[]} weekdayは0(日)〜6(土)
 */
export function calendarDays(year: number, month: number): { ymd: Ymd; weekday: number; outOfRange: boolean }[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = Date.UTC(year, month - 1, 1 - (first.getUTCDay() || 7));
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start + i * 24 * 60 * 60 * 1000);
    const ymd = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    };
    return {
      ymd,
      weekday: date.getUTCDay(),
      outOfRange: ymd.year !== year || ymd.month !== month
    };
  });
}
