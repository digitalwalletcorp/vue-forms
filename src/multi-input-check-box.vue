<!--
複数選択チェックボックス
複数のチェックボックスを1つの配列に束縛する。単一のチェックボックスとは値の扱いが異なるため、InputCheckBoxとは別のコンポーネントとする
-->
<template>
  <div
    v-tooltip.right="errorMessage"
    class="dwui-multi-input-check-box"
    :class="{ 'dwui-error': hasError }"
  >
    <label>
      <input
        :id="props.id"
        ref="refInputCheckBox"
        v-model="binding"
        type="checkbox"
        :value="props.value"
        :name="props.name"
        :disabled="props.disabled"
        :class="props.inputClass"
        :style="props.inputStyle"
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
import { computed, ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';
import type { NumberModelType, StringModelType } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。チェックされたチェックボックスのvalueの配列 */
  modelValue: (StringModelType | NumberModelType)[];
  /** 配列の要素の型。未指定の場合は'string' */
  modelType?: 'string' | 'number';
  /** このチェックボックスの値。チェックすると配列に加わる */
  value?: StringModelType | NumberModelType;
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
  modelType: 'string'
});

interface Emits {
  (e: 'update:modelValue', value: (StringModelType | NumberModelType)[]): void;
  (e: 'emit:change', value: (StringModelType | NumberModelType)[]): void;
}
const emit = defineEmits<Emits>();

interface Slots {
  default?(): unknown;
}
defineSlots<Slots>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputCheckBox = ref<HTMLInputElement>();

// チェックの付け外しに合わせた配列の要素の追加・削除は、ネイティブのv-modelに任せる
const binding = computed({
  get: () => props.modelValue,
  set: (value: (StringModelType | NumberModelType)[]) => {
    const emitValue = props.modelType === 'number'
      ? value.map(a => a == null ? a : Number(a))
      : value;
    emitChange(emitValue);
  }
});

/**
 * update:modelValueとemit:changeを同じ値で発火する
 *
 * @param {(string | number | null)[]} value バインド値
 */
const emitChange = (value: (StringModelType | NumberModelType)[]): void => {
  emit('update:modelValue', value);
  emit('emit:change', value);
};

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputCheckBox.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputCheckBox.value!.focus();
  },
  /**
   * 現在のバインド値でChangeイベントを発火する
   */
  fireChange: (): void => {
    emitChange(props.modelValue);
  }
});
</script>

<style>
/* 並べたチェックボックス同士の間隔 */
:where(.dwui-multi-input-check-box) {
  display: inline-block;
  margin-right: 4px;
}

/* ブラウザ既定のbaselineではボタンが文字より上に寄るため、ボタンと文字の中心を揃える */
:where(.dwui-multi-input-check-box > label > input, .dwui-multi-input-check-box > label > span) {
  vertical-align: middle;
}

/* チェックボックスとラベルの間隔。gapはflex専用のためmarginで空ける */
:where(.dwui-multi-input-check-box > label > span) {
  margin-left: var(--dwui-gap-multi-input-check-box, 2px);
}

:where(.dwui-multi-input-check-box > label > input:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
