<!--
1行テキスト入力
-->
<template>
  <input
    ref="refInputText"
    v-tooltip.right="errorMessage"
    type="text"
    :value="props.modelValue"
    class="dwui-input-text"
    :class="{ 'dwui-error': hasError }"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
  >
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { vTooltip } from 'floating-vue';
import { NumberUtil } from '@digitalwalletcorp/utils';
import { useInputError } from '@/error-observer';
import * as FormHelper from '@/internal/form-helper';
import type { AllowType, NumberModelType, StringModelType } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値 */
  modelValue?: StringModelType | NumberModelType;
  /** バインド値の型。未指定の場合は'string' */
  modelType?: 'string' | 'number' | 'comma-digit';
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** 許容種別 */
  allowType?: AllowType;
  /** 許容正規表現 */
  allowRegexp?: string | RegExp | null;
}
const props = withDefaults(defineProps<Props>(), {
  modelType: 'string'
});

interface Emits {
  (e: 'update:modelValue', value: StringModelType | NumberModelType): void;
  (e: 'emit:blur', value: StringModelType | NumberModelType): void;
  (e: 'emit:enter', value: StringModelType | NumberModelType): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputText = ref<HTMLInputElement>();

const composing = ref(false);

const shouldBeNumber = computed(() => ['number', 'comma-digit'].includes(props.modelType));

/** IME編集開始 */
const onCompositionStart = (): void => {
  composing.value = true;
};

/** IME編集終了 */
const onCompositionEnd = (e: Event): void => {
  composing.value = false;
  onInput(e);
};

const onInput = (e: Event) => {
  if (composing.value) {
    return;
  }
  const target = e.target as HTMLInputElement;
  const selectionEnd = target.selectionEnd;
  let cursorFixNeeded = false;
  let value = target.value;
  if (props.allowType) {
    if (!FormHelper.checkAllowType(value, props.allowType)) {
      value = FormHelper.filterInput(value, { allowType: props.allowType });
      cursorFixNeeded = true;
    }
  }
  if (props.allowRegexp) {
    if (!FormHelper.checkRegExp(value, props.allowRegexp)) {
      value = FormHelper.filterInput(value, { allowRegexp: props.allowRegexp });
      cursorFixNeeded = true;
    }
  }

  if (shouldBeNumber.value && Number.isNaN(Number(value))) {
    // モデルタイプがnumberでallowTypeやallowRegExpの指定がなく不正な入力値になっている場合は
    // decimalのフィルターをかけて入力前の状態に戻す
    value = FormHelper.filterInput(value, { allowType: 'decimal' });
    switch (true) {
      case value === '.':
        // ドットだけが入力された場合はクリアする
        value = '';
        break;
      case /^[\-+]?\.$/.test(value):
        // 符号＋ドットが入力された場合は符号のみ残す
        value = value.charAt(0);
        break;
      default:
    }
    cursorFixNeeded = true;
  }
  if (value !== target.value) {
    // ここで明示的に値を入れないと元の入力値が残ってしまう
    target.value = value;
  }
  let emitValue: StringModelType | NumberModelType = value;
  let emittable = true;
  if (shouldBeNumber.value) {
    switch (true) {
      case value === '':
      case value === 'null':
        emitValue = null;
        break;
      case value === '+':
      case value === '-':
      case /^[\-+]0(\.0*)?$/.test(value):
        // 符号だけ、または「符号と0と小数点以下連続する0」(あるいはそのパターンで入力途中)のときはemitしない
        emitValue = value;
        emittable = false;
        cursorFixNeeded = false;
        break;
      default:
        emitValue = Number(value);
    }
  }
  if (emittable) {
    emit('update:modelValue', emitValue);
  }
  if (cursorFixNeeded) {
    // intentionally async call
    void nextTick(() => {
      const pos = (selectionEnd || 0) - 1;
      target.setSelectionRange(pos, pos);
    });
  }
};

const onFocus = (e: Event) => {
  if (props.modelType === 'comma-digit') {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/,/g, '');
  }
};

const onBlur = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value;
  let emitValue: StringModelType | NumberModelType = value;
  switch (props.modelType) {
    case 'comma-digit':
    case 'number':
      switch (value) {
        case '':
        case 'null':
        case '+':
        case '-':
          emitValue = null;
          target.value = '';
          break;
        default:
          if (props.modelType === 'comma-digit') {
            const num = Number(value.replace(/,/g, ''));
            emitValue = num;
            target.value = NumberUtil.formatComma(num);
          } else {
            emitValue = Number(value);
          }
      }
      break;
    default:
  }
  emit('update:modelValue', emitValue);
  emit('emit:blur', emitValue);
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const target = e.target as HTMLInputElement;
    if (target && !e.isComposing) {
      e.preventDefault();
      emit('emit:enter', target.value || '');
    }
  }
};

onMounted(() => {
  // comma-digitは初期表示時にカンマ整形する(以降の整形はonBlurが担う)
  if (props.modelType === 'comma-digit' && refInputText.value && props.modelValue != null && props.modelValue !== '') {
    const num = Number(props.modelValue);
    if (!Number.isNaN(num)) {
      refInputText.value.value = NumberUtil.formatComma(num);
    }
  }
});

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputText.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputText.value!.focus();
  },
  /**
   * INPUTエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    if (refInputText.value) {
      onBlur({ target: refInputText.value } as unknown as FocusEvent);
    }
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string | number | null}
   */
  getCurrentValue: (): StringModelType | NumberModelType => {
    const value = refInputText.value!.value;
    if (!shouldBeNumber.value) {
      return value;
    }
    // comma-digitはフォーカスが外れている間カンマ区切りで表示しているため、カンマを除いて数値にする
    const plain = value.replace(/,/g, '');
    return ['', 'null'].includes(plain) ? null : Number(plain);
  }
});
</script>

<style>
:where(.dwui-input-text.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-input-text:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
