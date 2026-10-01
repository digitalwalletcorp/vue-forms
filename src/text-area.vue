<!--
複数行テキスト入力
-->
<template>
  <textarea
    ref="refTextArea"
    v-tooltip.right="errorMessage"
    :value="props.modelValue ?? ''"
    :maxlength="props.maxlength"
    class="dwui-text-area"
    :class="{
      'dwui-error': hasError,
      'dwui-maximum-length': isMaximumLength || isAlertMaximumLength
    }"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';
import * as FormHelper from '@/internal/form-helper';
import type { AllowType, StringModelType } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値 */
  modelValue?: string | null;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** 最大長。この長さに達すると最大長の表示になる */
  maxlength?: number;
  /** 最大長の警告を出す長さ。この長さを超えると最大長の表示になる */
  alertMaxlength?: number;
  /** 許容種別 */
  allowType?: AllowType;
  /** 許容正規表現 */
  allowRegexp?: string | RegExp | null;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', value: StringModelType): void;
  (e: 'emit:blur', value: StringModelType): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refTextArea = ref<HTMLTextAreaElement>();

const isMaximumLength = computed(() => {
  return props.maxlength != null && props.modelValue?.length === props.maxlength;
});

const isAlertMaximumLength = computed(() => {
  return props.alertMaxlength != null && props.alertMaxlength < (props.modelValue?.length || 0);
});

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  let value: string = target.value;
  if (props.allowType) {
    if (!FormHelper.checkAllowType(value, props.allowType)) {
      value = FormHelper.filterInput(value, { allowType: props.allowType });
    }
  }
  if (props.allowRegexp) {
    if (!FormHelper.checkRegExp(value, props.allowRegexp)) {
      value = FormHelper.filterInput(value, { allowRegexp: props.allowRegexp });
    }
  }
  if (value !== target.value) {
    // ここで明示的に値を入れないと元の入力値が残ってしまう
    target.value = value;
  }
  emit('update:modelValue', value);
};

const onBlur = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('emit:blur', target.value);
};

defineExpose({
  /**
   * TEXTAREAエレメントを返す
   */
  getInstance: (): HTMLTextAreaElement | undefined => {
    return refTextArea.value;
  },
  /**
   * TEXTAREAエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refTextArea.value!.focus();
  },
  /**
   * TEXTAREAエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    emit('emit:blur', refTextArea.value!.value);
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string}
   */
  getCurrentValue: (): string => {
    return refTextArea.value!.value;
  }
});
</script>

<style>
:where(.dwui-text-area.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-text-area.dwui-maximum-length) {
  background: var(--dwui-background-text-area-maximum-length, light-dark(#f2f3ca, #4d4a1f));
  color: var(--dwui-color-text-text-area-maximum-length, light-dark(crimson, #ff9a9a));
}

:where(.dwui-text-area:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
