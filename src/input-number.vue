<!--
数値入力
-->
<template>
  <input
    ref="refInputNumber"
    v-tooltip.right="errorMessage"
    type="number"
    :value="props.modelValue"
    :min="props.min"
    :max="props.max"
    class="dwui-input-number"
    :class="{ 'dwui-error': hasError }"
    @input="onInput"
    @blur="onBlur"
    @keydown="onKeyDown"
  >
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';
import { VueFormsError } from '@/errors';
import type { NumberModelType } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値 */
  modelValue?: number | null;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** 最小値。blur時にこの値を下回る入力はこの値に補正する */
  min?: number;
  /** 最大値。blur時にこの値を上回る入力はこの値に補正する */
  max?: number;
  /** 小数点以下の桁数の上限。超えた桁は入力時に切り捨てる。0の場合は小数点を入力できない */
  scale?: number;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', value: NumberModelType): void;
  (e: 'emit:blur', value: NumberModelType): void;
  (e: 'emit:enter', value: NumberModelType): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputNumber = ref<HTMLInputElement>();

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let value = target.value;
  if (value && props.scale != null) {
    const decimalIndex = target.value.indexOf('.');
    if (0 <= decimalIndex && props.scale < target.value.length - (decimalIndex + 1)) {
      // 小数点以下の桁数がscaleを超える場合
      value = target.value.substring(0, decimalIndex + 1 + props.scale);
      target.value = value;
    }
  }
};

const onKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'e':
    case 'E':
      // type="number"は指数表記を受け付けるが、この部品では扱わない
      e.preventDefault();
      break;
    case '.':
      if (props.scale === 0) {
        // scaleが0の場合はドットの入力を認めない
        e.preventDefault();
      }
      break;
    case 'Enter': {
      const target = e.target as HTMLInputElement;
      if (target && !e.isComposing) {
        e.preventDefault();
        emit('emit:enter', toModelValue(target.valueAsNumber));
      }
      break;
    }
    default:
  }
};

const onBlur = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let emitValue = target.valueAsNumber;
  if (!Number.isNaN(emitValue)) {
    if (props.min != null) {
      emitValue = Math.max(emitValue, props.min);
    }
    if (props.max != null) {
      emitValue = Math.min(emitValue, props.max);
    }
    if (props.modelValue === emitValue) {
      // 入力値補正後に元の値と同じになった場合、emitによるイベントが発火しないので、
      // 補正した値をelementに設定する
      target.value = String(emitValue);
    }
  }
  const retVal = toModelValue(emitValue);
  emit('update:modelValue', retVal);
  emit('emit:blur', retVal);
};

/**
 * valueAsNumberをバインド値に変換する。空欄や数値でない入力はNaNになるためnullにする
 *
 * @param {number} value valueAsNumber
 * @returns {number | null}
 */
const toModelValue = (value: number): NumberModelType => {
  return Number.isNaN(value) ? null : value;
};

onBeforeMount(() => {
  if (props.scale != null && props.scale < 0) {
    throw new VueFormsError(`Scale on InputNumber does not support negative value: ${props.scale}`);
  }
});

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputNumber.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputNumber.value!.focus();
  },
  /**
   * INPUTエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    if (refInputNumber.value) {
      onBlur({ target: refInputNumber.value } as unknown as FocusEvent);
    }
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {number | null}
   */
  getCurrentValue: (): NumberModelType => {
    return toModelValue(refInputNumber.value!.valueAsNumber);
  }
});
</script>

<style>
:where(.dwui-input-number.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-input-number:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
