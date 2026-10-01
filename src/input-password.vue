<!--
パスワード入力
-->
<template>
  <input
    ref="refInputPassword"
    v-tooltip.right="errorMessage"
    type="password"
    :value="props.modelValue"
    class="dwui-input-password"
    :class="{ 'dwui-error': hasError }"
    @input="onInput"
    @blur="onBlur"
    @keydown="onKeydown"
  >
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
  /** 許容種別 */
  allowType?: AllowType;
  /** 許容正規表現 */
  allowRegexp?: string | RegExp | null;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', value: StringModelType): void;
  (e: 'emit:blur', value: StringModelType): void;
  (e: 'emit:enter', value: StringModelType): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputPassword = ref<HTMLInputElement>();

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
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
  const target = e.target as HTMLInputElement;
  emit('emit:blur', target.value);
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

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputPassword.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputPassword.value!.focus();
  },
  /**
   * INPUTエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    emit('emit:blur', refInputPassword.value!.value);
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string}
   */
  getCurrentValue: (): string => {
    return refInputPassword.value!.value;
  }
});
</script>

<style>
:where(.dwui-input-password.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-input-password:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
