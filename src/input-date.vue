<!--
日付・時刻の入力
書式(formatType)のテンプレートに沿って入力を受け付ける。calendarを指定すると、日付・時刻の選択をドロップダウンで開くボタンを表示する
-->
<template>
  <div
    v-tooltip.right="invalidMessage || errorMessage"
    class="dwui-input-date"
    :class="{ 'dwui-error': invalidMessage || hasError }"
  >
    <input
      :id="props.id"
      ref="refInputDate"
      type="text"
      :value="displayValue"
      :name="props.name"
      :placeholder="props.placeholder"
      :size="textboxSize"
      :readonly="props.readonly"
      :disabled="props.disabled"
      :class="props.inputClass"
      :style="props.inputStyle"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeyDown"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    >
    <Dropdown
      v-if="showCalendar"
      :shown="showDatePicker"
      :triggers="[]"
      placement="bottom-start"
      popper-class="dwui-dropdown"
      @update:shown="showDatePicker = $event"
    >
      <button
        type="button"
        class="dwui-input-date-button"
        :class="props.buttonClass"
        :style="props.buttonStyle"
        :aria-label="typeDatePicker ? 'Open calendar' : 'Open time picker'"
        :disabled="props.disabled"
        @click="onToggleDatePicker"
      >
        <SvgCalendar
          v-if="typeDatePicker"
          :size="20"
        />
        <SvgClock
          v-else
          :size="20"
          :duration="100"
        />
      </button>
      <template #popper>
        <DatePicker
          v-if="showDatePicker"
          :model-value="props.modelValue"
          :date-format="dateFormat"
          :timezone="timezone"
          :fetch-holidays="fetchHolidays"
          @emit:select-day="emitSelectDay"
          @emit:change-time="emitChangeTime"
        />
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { Dropdown, vTooltip } from 'floating-vue';
import { useI18n } from 'vue-i18n';
import { SvgCalendar, SvgClock } from '@digitalwalletcorp/vue-svg-icons';
import { useInputError } from '@/error-observer';
import { VueFormsError } from '@/errors';
import { inputDateOptionsKey } from '@/input-date-options';
import type { InputDateHoliday } from '@/input-date-options';
import { isValidDateValue } from '@/internal/date';
import DatePicker from '@/internal/date-picker.vue';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。区切り文字を除いた数字の並び(yyyyMMdd など) */
  modelValue?: string | null;
  /** 書式 */
  formatType: 'date' | 'time' | 'datetime' | 'dateHourMinute' | 'timestamp' | 'year' | 'yearMonth' | 'monthDay' | 'hourMinute';
  /** 日付・時刻の選択を開くボタンを表示する */
  calendar?: boolean;
  /** 「今日」の基準にするIANAのタイムゾーン名。未指定ならinputDateOptionsKeyでprovideされた値、それも無ければブラウザのローカル時刻 */
  timezone?: string;
  /** 指定した年月の祝日を返す。未指定ならinputDateOptionsKeyでprovideされた値、それも無ければ祝日を表示しない */
  fetchHolidays?: (year: number, month: number) => Promise<InputDateHoliday[]>;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** inputのid。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  id?: string;
  /** inputのname。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  name?: string;
  /** inputのplaceholder。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  placeholder?: string;
  /** inputの読取専用。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  readonly?: boolean;
  /** inputの非活性。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  disabled?: boolean;
  /** inputに付けるclass */
  inputClass?: ClassValue;
  /** inputに付けるstyle */
  inputStyle?: StyleValue;
  /** 日付・時刻の選択を開くボタンに付けるclass */
  buttonClass?: ClassValue;
  /** 日付・時刻の選択を開くボタンに付けるstyle */
  buttonStyle?: StyleValue;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'emit:blur', value: string): void;
  (e: 'emit:enter', value: string): void;
  (e: 'emit:selectDay', value: string): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);
const options = inject(inputDateOptionsKey, {});
const { t, te } = useI18n();

const TEMPLATE_DATE = Array.from('____-__-__');
const TEMPLATE_TIME = Array.from('__:__:__');
const TEMPLATE_DATETIME = Array.from('____-__-__ __:__:__');
const TEMPLATE_DATE_HOUR_MINUTE = Array.from('____-__-__ __:__');
const TEMPLATE_TIMESTAMP = Array.from('____-__-__ __:__:__.___');
const TEMPLATE_YEAR = Array.from('____');
const TEMPLATE_YEAR_MONTH = Array.from('____-__');
const TEMPLATE_MONTH_DAY = Array.from('__-__');
const TEMPLATE_HOUR_MINUTE = Array.from('__:__');

/** 入力値が不正なときにツールチップに出す文言のメッセージキーと、アプリのi18nメッセージに無いときの文言 */
const INVALID_MESSAGES = {
  date: {
    key: 'dwui.input-date.invalid-date',
    fallback: 'Invalid date'
  },
  time: {
    key: 'dwui.input-date.invalid-time',
    fallback: 'Invalid time'
  },
  format: {
    key: 'dwui.input-date.invalid-format',
    fallback: 'Invalid format'
  }
};

const showDatePicker = ref(false);
const composing = ref(false);
const compositionStartIndex = ref(0);
const compositionEndIndex = ref(0);
const key = ref('');
const selectionStart = ref(0);
const selectionEnd = ref(0);

const refInputDate = ref<HTMLInputElement>();

/**
 * フォーマット種別に応じたテンプレート(1文字づつの配列)
 */
const templateArray = computed(() => {
  switch (props.formatType) {
    case 'date':
      return TEMPLATE_DATE;
    case 'time':
      return TEMPLATE_TIME;
    case 'datetime':
      return TEMPLATE_DATETIME;
    case 'dateHourMinute':
      return TEMPLATE_DATE_HOUR_MINUTE;
    case 'timestamp':
      return TEMPLATE_TIMESTAMP;
    case 'year':
      return TEMPLATE_YEAR;
    case 'yearMonth':
      return TEMPLATE_YEAR_MONTH;
    case 'monthDay':
      return TEMPLATE_MONTH_DAY;
    case 'hourMinute':
      return TEMPLATE_HOUR_MINUTE;
    default:
      throw new VueFormsError(`Unsupported formatType on InputDate: ${props.formatType}`);
  }
});

/**
 * フォーマット種別に応じたフォーマット
 */
const dateFormat = computed((): string => {
  switch (props.formatType) {
    case 'date':
      return 'yyyy-MM-dd';
    case 'time':
      return 'HH:mm:ss';
    case 'datetime':
      return 'yyyy-MM-dd HH:mm:ss';
    case 'dateHourMinute':
      return 'yyyy-MM-dd HH:mm';
    case 'timestamp':
      return 'yyyy-MM-dd HH:mm:ss.SSS';
    case 'year':
      return 'yyyy';
    case 'yearMonth':
      return 'yyyy-MM';
    case 'monthDay':
      return 'MM-dd';
    case 'hourMinute':
      return 'HH:mm';
    default:
      throw new VueFormsError(`Unsupported formatType on InputDate: ${props.formatType}`);
  }
});

/**
 * 表示用日付書式から区切り文字（ハイフンやコロン）を取り除いたプレーンなフォーマットを返す
 *
 * @returns {string} プレーンなフォーマット
 */
const plainFormat = computed((): string => {
  return dateFormat.value.replace(/[^yMdHmsS]/g, '');
});

/**
 * 入力された値が不正なときにツールチップに出す文言。不正でなければ空文字
 */
const invalidMessage = computed((): string => {
  if (!props.modelValue || isValidDateValue(props.modelValue, plainFormat.value)) {
    return '';
  }
  let message;
  switch (props.formatType) {
    case 'time':
    case 'hourMinute':
      message = INVALID_MESSAGES.time;
      break;
    case 'datetime':
    case 'dateHourMinute':
    case 'timestamp':
      message = INVALID_MESSAGES.format;
      break;
    default:
      message = INVALID_MESSAGES.date;
  }
  return te(message.key) ? t(message.key) : message.fallback;
});

/** 「今日」の基準にするタイムゾーン。propsが優先で、無ければアプリ既定の設定 */
const timezone = computed((): string | undefined => props.timezone ?? options.timezone);

/** 祝日の取得。propsが優先で、無ければアプリ既定の設定 */
const fetchHolidays = computed(() => props.fetchHolidays ?? options.fetchHolidays);

/**
 * フォーマット種別に応じたテンプレート（文字列）を返す
 *
 * @returns {string} テンプレート
 */
const templateString = computed((): string => {
  return templateArray.value.join('');
});

/**
 * 表示文字列を返す
 *
 * @returns {string} 表示用文字列
 */
const displayValue = computed((): string => {
  return createDisplayArray(props.modelValue).join('');
});

/**
 * カレンダー表示を許容するフォーマット種別であるか判定する
 *
 * @returns {boolean} フォーマット種別が以下の場合は許容
 *   date
 *   datetime
 *   datehourMinute
 *   timestamp
 *   monthDay
 *   time
 *   hourMinute
 */
const showCalendar = computed((): boolean => {
  return typeDatePicker.value || typeTimePicker.value;
});

/**
 * DatePicker表示を許容するフォーマット種別であるか判定する
 *
 * @returns {boolean} フォーマット種別が以下の場合は許容
 *   date
 *   datetime
 *   dateHourMinute
 *   timestamp
 *   monthDay
 */
const typeDatePicker = computed(() => {
  if (props.calendar) {
    switch (props.formatType) {
      case 'date':
      case 'datetime':
      case 'dateHourMinute':
      case 'timestamp':
      case 'monthDay':
        return true;
      default:
    }
  }
  return false;
});

/**
 * TimePicker表示を許容するフォーマット種別であるか判定する
 *
 * @returns {boolean} フォーマット種別が以下の場合は許容
 *   dateHourMinute
 *   timestamp
 *   monthDay
 *   time
 *   hourMinute
 */
const typeTimePicker = computed(() => {
  if (props.calendar) {
    switch (props.formatType) {
      case 'dateHourMinute':
      case 'timestamp':
      case 'time':
      case 'hourMinute':
        return true;
      default:
    }
  }
  return false;
});

/**
 * テキストボックスのサイズ(size)を返す
 *
 * @returns {number} サイズ
 */
const textboxSize = computed(() => {
  switch (props.formatType) {
    case 'date':
      return 12;
    case 'time':
      return 9;
    case 'datetime':
      return 21;
    case 'dateHourMinute':
      return 17;
    case 'timestamp':
      return 24;
    case 'year':
      return 7;
    case 'yearMonth':
      return 9;
    case 'monthDay':
      return 7;
    case 'hourMinute':
      return 7;
    default:
      throw new VueFormsError(`Unsupported formatType on InputDate: ${props.formatType}`);
  }
});

/**
 * 画面表示用文字列を生成する
 * 例)
 * format-type="date" で props.modelValueが 20221201 の場合、2022-12-01 を返す
 * format-type="datetime" で props.modelValueが 20221201121635 の場合 2022-12-01 12:16:35 を返す
 *
 * @param {string | null | undefined} strings 表示文字列
 * @returns {string[]} 画面表示用文字配列
 */
const createDisplayArray = (strings: string | null | undefined): string[] => {
  const arr = strings == null ? [] : Array.from(strings);
  let skip = 0;
  return templateArray.value.map((template, index) => {
    const ch = arr[index + skip];
    if (template === '_') {
      return ch || '_';
    }
    skip--;
    return template;
  });
};

/**
 * テンプレートの入力可能位置の文字のみ抽出して返す
 *
 * @param {string[]} strings
 * @returns {string[]}
 */
const createEmitValue = (strings: string[]): string[] => {
  const emitValue = strings.filter((a, index) => {
    if (templateArray.value[index] === '_') {
      return true;
    }
    return false;
  });
  return emitValue;
};

/**
 * キー押下
 *
 * @param {KeyboardEvent} e イベント
 */
const onKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLInputElement;
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    emit('emit:enter', toModelValue(target.value));
    return;
  }
  key.value = e.key;
  selectionStart.value = target.selectionStart as number;
  selectionEnd.value = target.selectionEnd as number;
};

/**
 * IME編集開始
 *
 * @param {CompositionEvent} e イベント
 */
const onCompositionStart = (e: CompositionEvent) => {
  composing.value = true;
  compositionStartIndex.value = (e.target as HTMLInputElement).selectionStart as number;
  compositionEndIndex.value = (e.target as HTMLInputElement).selectionEnd as number;
};

/**
 * IME編集終了
 *
 * @param {CompositionEvent} e イベント
 */
const onCompositionEnd = (e: CompositionEvent) => {
  const input = e.data;
  const target = e.target as HTMLInputElement;
  const newValue = Array.from(target.value);
  newValue.splice(compositionStartIndex.value + input.length, input.length);
  target.value = newValue.join('');
  target.selectionStart = compositionStartIndex.value;
  target.selectionEnd = compositionStartIndex.value + input.length;
  selectionStart.value = compositionStartIndex.value;
  selectionEnd.value = compositionEndIndex.value;
  composing.value = false;
  if (key.value !== 'Backspace' && key.value !== 'Delete') {
    onInput(e);
  }
};

/**
 * 入力値変更
 *
 * 挙動の整理
 * ・元の入力値を props.modelValue とする
 * ・selectionStart/Endを参照して入力された文字のインデックスを把握する
 *   (範囲選択されている場合はその部分を初期化する)
 * ・入力された文字(列)を把握する
 * ・元の入力値に対して入力された文字をインデックスに沿って嵌め込む
 *   このとき、テンプレートの入力不可部分にある文字と同じ、あるいはその代替文字とみなされる場合はテンプレートの文字に置き換えて適用する
 *   異なる場合は1文字スキップしてテンプレートの次の文字に適用する
 * ・Backspaceの場合は削除した文字の左側にカーソルがくる
 *   (範囲選択している場合も同様)
 * ・Deleteの場合は削除した文字の右側にカーソルがくる
 *   (範囲選択している場合も同様)
 * ・通常入力の場合は入力された文字の右側にカーソルがくる
 *   (右側に入力不可部分がある場合も同様)
 *   (ペーストした場合もペーストした最後の文字の右側にカーソルがくる)
 * ・出来上がった文字列から入力不可文字を取り除いてemitする
 *   (テンプレートと同じ文字列になった場合はブランクをemitする)
 *
 * @param {Event} e イベント
 */
const onInput = (e: Event) => {
  if (composing.value) {
    return;
  }
  const target = e.target as HTMLInputElement;
  // * ・元の入力値を props.modelValue とする
  const dispArray = createDisplayArray(props.modelValue as string);
  // * ・selectionStart/Endを参照して入力された文字のインデックスを把握する
  const end = target.selectionEnd as number;
  const selectionRange = {
    start: selectionStart.value,
    end: selectionEnd.value
  };
  // *   (範囲選択されている場合はその部分を初期化する)
  for (let i = selectionRange.start; i < selectionRange.end; i++) {
    dispArray[i] = templateArray.value[i];
  }
  // * ・入力された文字(列)を把握する
  const inputText = target.value.substring(selectionRange.start, end);
  // * ・元の入力値に対して入力された文字をインデックスに沿って嵌め込む
  // *   このとき、テンプレートの入力不可部分にある文字と同じ、あるいはその代替文字とみなされる場合はテンプレートの文字に置き換えて適用する
  // *   異なる場合は1文字スキップしてテンプレートの次の文字に適用する
  let skipIndex = 0;
  let inputIndex = 0;
  for (let i = 0; i < dispArray.length; i++) {
    if (selectionRange.start <= i && i < end + skipIndex) {
      if (templateArray.value[i] !== '_') {
        switch (true) {
          case templateArray.value[i] === '-' && inputText.charAt(inputIndex) === '-':
          case templateArray.value[i] === '-' && inputText.charAt(inputIndex) === '/':
          case templateArray.value[i] === ' ' && inputText.charAt(inputIndex) === ' ':
          case templateArray.value[i] === ':' && inputText.charAt(inputIndex) === ':':
            inputIndex++;
            break;
          default:
            skipIndex++;
        }
        continue;
      }
      dispArray[i] = inputText.charAt(inputIndex++);
    }
  }
  let cursorIndex: number;
  switch (key.value) {
    case 'Backspace':
      // * ・Backspaceの場合は削除した文字の左側にカーソルがくる
      cursorIndex = selectionRange.start;
      if (selectionRange.start === selectionRange.end) {
        // 範囲選択されていない場合
        if (templateArray.value[cursorIndex - 1] === '_') {
          // Backspaceの対象が入力可能部分
          dispArray[cursorIndex - 1] = '_';
        } else {
          // Backspaceの対象が入力不可部分
          cursorIndex--;
          dispArray[cursorIndex - 1] = '_';
        }
        cursorIndex--;
      }
      break;
    case 'Delete':
      // * ・Deleteの場合は削除した文字の右側にカーソルがくる
      cursorIndex = selectionRange.end;
      if (selectionRange.start === selectionRange.end) {
        // 範囲選択されていない場合
        if (templateArray.value[cursorIndex] === '_') {
          // Deleteの対象が入力可能部分
          dispArray[cursorIndex] = '_';
        } else {
          // Deleteの対象が入力不可部分
          cursorIndex++;
          dispArray[cursorIndex] = '_';
        }
        cursorIndex++;
      }
      break;
    default:
      // * ・通常入力の場合は入力された文字の右側にカーソルがくる
      cursorIndex = end;
  }
  // * ・出来上がった文字列をemitする
  // テンプレートと異なる場合は入力可能部分のみ入力値で置き換えた文字列を通知
  const displayTextArray = dispArray.map((a, index) => {
    if (templateArray.value[index] === '_') {
      return a;
    }
    return templateArray.value[index];
  });
  const emitValue = templateArray.value.every((a, index) => a === displayTextArray[index])
    ? '' // テンプレートと同じ場合はブランクを通知
    : createEmitValue(dispArray).join('');
  emit('update:modelValue', emitValue);
  // intentionally async call
  void nextTick(() => {
    setValue(displayTextArray.join(''), cursorIndex + skipIndex);
  });
};

/**
 * 日付・時刻の選択の開閉
 */
const onToggleDatePicker = (): void => {
  if (!props.disabled && !props.readonly) {
    showDatePicker.value = !showDatePicker.value;
  }
};

/**
 * 変更確定
 *
 * @param {Event} e イベント
 */
const onBlur = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('emit:blur', toModelValue(target.value));
};

/**
 * カレンダーの日付選択イベント
 *
 * @param {string} date 選択した日付(yyyyMMdd)
 */
const emitSelectDay = (date: string) => {
  showDatePicker.value = false;
  let value: string;
  switch (props.formatType) {
    case 'monthDay':
      value = date.substring(4);
      break;
    case 'datetime':
    case 'dateHourMinute':
    case 'timestamp': {
      // 日付だけを差し替える。時刻が未入力のまま残ると書式エラーになるため、時刻の選択の初期表示(00)に合わせて0で埋める
      const current = (props.modelValue ?? '').padEnd(plainFormat.value.length, '_');
      value = (date + current.substring(date.length)).replace(/_/g, '0');
      break;
    }
    default:
      value = date;
  }
  emit('update:modelValue', value);
  emit('emit:selectDay', value);
  setValue(createDisplayArray(value).join(''), 0);
};

/**
 * タイムピッカーの時刻変更イベント
 *
 * @param {'hour' | 'minute' | 'second'} unit 単位
 * @param {string} value 時刻
 */
const emitChangeTime = (unit: 'hour' | 'minute' | 'second', value: string): void => {
  // 入力途中の値は書式より短いことがあるため、未入力の位置を_で埋めてから時刻を差し替える
  const time = Array.from((props.modelValue ?? '').padEnd(plainFormat.value.length, '_'));
  let pos = 0;
  switch (unit) {
    case 'hour':
      pos = plainFormat.value.indexOf('HH');
      break;
    case 'minute':
      pos = plainFormat.value.indexOf('mm');
      break;
    case 'second':
      pos = plainFormat.value.indexOf('ss');
      break;
    default:
  }
  const val = Array.from(value || '__');
  val.forEach(v => {
    time[pos++] = v;
  });
  if (value) {
    // 残りの時刻の桁(時・分・秒・ミリ秒)が未入力なら0で埋め、1つ選んだ時点で有効な時刻にする。日付の桁は埋めない
    for (let i = 0; i < time.length; i++) {
      if (time[i] === '_' && /[HmsS]/.test(plainFormat.value.charAt(i))) {
        time[i] = '0';
      }
    }
  }
  const t = time.join('');
  const emitValue = templateString.value.replace(/[^_]/g, '') === t ? '' : t;
  emit('update:modelValue', emitValue);
};

/**
 * 表示中の文字列をバインド値にする
 * テンプレートのままなら空文字、そうでなければ入力可能な位置の文字だけを返す
 *
 * @param {string} displayString 表示中の文字列
 * @returns {string}
 */
const toModelValue = (displayString: string): string => {
  return displayString === templateString.value ? '' : createEmitValue(Array.from(displayString)).join('');
};

/**
 * 表示用入力値とカーソル位置の設定を行う
 *
 * @param {string} displayValue 表示用入力値
 * @param {number} cursorPosition カーソル位置
 */
const setValue = (displayValue: string, cursorPosition: number) => {
  const element = refInputDate.value!;
  element.value = displayValue;
  let cursor;
  if (cursorPosition < 0) {
    cursor = 0;
  } else if (displayValue.length < cursorPosition) {
    cursor = displayValue.length;
  } else {
    cursor = cursorPosition;
  }
  element.setSelectionRange(cursor, cursor);
};

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputDate.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputDate.value!.focus();
  },
  /**
   * INPUTエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    emit('emit:blur', toModelValue(refInputDate.value!.value));
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string}
   */
  getCurrentValue: (): string => {
    return toModelValue(refInputDate.value!.value);
  }
});
</script>

<style>
:where(.dwui-input-date) {
  display: inline-flex;
  align-items: center;
}

:where(.dwui-input-date.dwui-error > input) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

/* ボタンはアイコンだけを見せる */
:where(.dwui-input-date-button) {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  line-height: 0;
  cursor: pointer;
}

:where(.dwui-input-date-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:where(.dwui-input-date > input:focus-visible, .dwui-input-date-button:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}

/*
 * ドロップダウンのパネル(floating-vueのdropdownテーマ)の配色を、ページのcolor-schemeに合わせる。
 * テーマ側の指定(.v-popper--theme-dropdown .v-popper__inner)より詳細度を上げないと既定の白が勝つため、
 * ここだけは:where()で詳細度を0にせず、クラスを重ねて上書きする。色の変更は--dwui-*の変数で行う
 */
.v-popper--theme-dropdown.dwui-dropdown .v-popper__inner {
  border-color: var(--dwui-border-color-dropdown, light-dark(#dddddd, #4a4d55));
  background: var(--dwui-background-dropdown, light-dark(#ffffff, #2d2f34));
  color: var(--dwui-color-text-dropdown, light-dark(#000000, #e6e6e6));
}

.v-popper--theme-dropdown.dwui-dropdown .v-popper__arrow-inner {
  border-color: var(--dwui-background-dropdown, light-dark(#ffffff, #2d2f34));
}

.v-popper--theme-dropdown.dwui-dropdown .v-popper__arrow-outer {
  border-color: var(--dwui-border-color-dropdown, light-dark(#dddddd, #4a4d55));
}
</style>
