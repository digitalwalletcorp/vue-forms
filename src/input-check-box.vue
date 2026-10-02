<!--
チェックボックス
-->
<template>
  <div
    v-tooltip.right="errorMessage"
    class="dwui-input-check-box"
    :class="{ 'dwui-error': hasError }"
  >
    <label>
      <input
        :id="props.id"
        ref="refInputCheckBox"
        type="checkbox"
        :checked="props.modelValue === props.trueValue"
        :name="props.name"
        :disabled="props.disabled"
        :class="props.inputClass"
        :style="props.inputStyle"
        @change="onChange"
      >
      <!-- スロットに複数の要素が入っても1つにまとめ、ラベルとして扱えるようにする -->
      <span
        :class="props.labelClass"
        :style="props.labelStyle"
      >
        <slot />
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。trueValueと一致するときにチェック状態になる */
  modelValue?: string | number | boolean | null;
  /** チェックしたときの値 */
  trueValue?: string | number | boolean;
  /** チェックを外したときの値 */
  falseValue?: string | number | boolean;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** inputのid。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  id?: string;
  /** inputのname。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  name?: string;
  /** inputの非活性。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  disabled?: boolean;
  /** inputに付けるclass */
  inputClass?: ClassValue;
  /** inputに付けるstyle */
  inputStyle?: StyleValue;
  /** ラベル文字を包むspanに付けるclass */
  labelClass?: ClassValue;
  /** ラベル文字を包むspanに付けるstyle */
  labelStyle?: StyleValue;
}
const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false
});

interface Emits {
  (e: 'update:modelValue', value: string | number | boolean): void;
  (e: 'emit:change', value: string | number | boolean): void;
}
const emit = defineEmits<Emits>();

interface Slots {
  default?(): unknown;
}
defineSlots<Slots>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputCheckBox = ref<HTMLInputElement>();

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emitChange(toModelValue(target.checked));
};

/**
 * update:modelValueとemit:changeを同じ値で発火する
 *
 * @param {string | number | boolean} value バインド値
 */
const emitChange = (value: string | number | boolean): void => {
  emit('update:modelValue', value);
  emit('emit:change', value);
};

/**
 * チェック状態をtrueValue/falseValueに変換する
 *
 * @param {boolean} checked チェック状態
 * @returns {string | number | boolean}
 */
const toModelValue = (checked: boolean): string | number | boolean => {
  return checked ? props.trueValue : props.falseValue;
};

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputCheckBox.value;
  },
  /**
   * チェック状態の表示を設定する。バインド値は変更しない
   *
   * @param {boolean} value
   */
  setChecked: (value: boolean): void => {
    refInputCheckBox.value!.checked = value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputCheckBox.value!.focus();
  },
  /**
   * INPUTエレメントのChangeイベントを発火する
   */
  fireChange: (): void => {
    emitChange(toModelValue(refInputCheckBox.value!.checked));
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string | number | boolean}
   */
  getCurrentValue: (): string | number | boolean => {
    return toModelValue(refInputCheckBox.value!.checked);
  }
});
</script>

<style>
:where(.dwui-input-check-box) {
  display: inline-block;
}

/* ブラウザ既定のbaselineではボタンが文字より上に寄るため、ボタンと文字の中心を揃える */
:where(.dwui-input-check-box > label > input, .dwui-input-check-box > label > span) {
  vertical-align: middle;
}

/* チェックボックスとラベルの間隔。gapはflex専用のためmarginで空ける */
:where(.dwui-input-check-box > label > span) {
  margin-left: var(--dwui-gap-input-check-box, 2px);
}

:where(.dwui-input-check-box > label > input:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
