<!--
ラジオボタン
-->
<template>
  <div
    v-tooltip.right="errorMessage"
    class="dwui-input-radio"
    :class="{ 'dwui-error': hasError }"
  >
    <label>
      <input
        :id="props.id"
        ref="refInputRadio"
        type="radio"
        :value="props.item.value"
        :checked="props.item.value === String(props.modelValue)"
        :name="props.name"
        :disabled="props.disabled"
        :class="props.inputClass"
        :style="props.inputStyle"
        @change="onChange"
      >
      <span
        :class="props.labelClass"
        :style="props.labelStyle"
      >
        {{ label }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';
import { resolveLabel } from '@/internal/form-helper';
import type { BooleanModelType, NumberModelType, StringModelType, ValueLabelPair } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。item.valueと一致するときに選択状態になる */
  modelValue?: StringModelType | NumberModelType | BooleanModelType;
  /** バインド値の型。未指定の場合は'string' */
  modelType?: 'string' | 'number' | 'boolean';
  /** この選択肢の値とラベル */
  item: ValueLabelPair<string>;
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
  // modelValueの型にbooleanを含むため、未指定のときにfalseへ変換されないよう既定値を明示する
  modelValue: undefined,
  modelType: 'string'
});

interface Emits {
  (e: 'update:modelValue', value: StringModelType | NumberModelType | BooleanModelType): void;
  (e: 'emit:change', value: StringModelType | NumberModelType | BooleanModelType): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputRadio = ref<HTMLInputElement>();

const label = computed(() => resolveLabel(props.item.label));

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emitChange(toModelValue(target.value));
};

/**
 * update:modelValueとemit:changeを同じ値で発火する
 *
 * @param {string | number | boolean | null} value バインド値
 */
const emitChange = (value: StringModelType | NumberModelType | BooleanModelType): void => {
  emit('update:modelValue', value);
  emit('emit:change', value);
};

/**
 * inputの値をmodelTypeに合わせて変換する
 *
 * @param {string} value inputの値
 * @returns {string | number | boolean | null}
 */
const toModelValue = (value: string): StringModelType | NumberModelType | BooleanModelType => {
  if (props.modelType === 'number') {
    return ['', 'null'].includes(value) ? null : Number(value);
  }
  if (props.modelType === 'boolean') {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return null;
  }
  return value;
};

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputRadio.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputRadio.value!.focus();
  },
  /**
   * INPUTエレメントのChangeイベントを発火する
   */
  fireChange: (): void => {
    emitChange(toModelValue(refInputRadio.value!.value));
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string | number | boolean | null}
   */
  getCurrentValue: (): StringModelType | NumberModelType | BooleanModelType => {
    return toModelValue(refInputRadio.value!.value);
  }
});
</script>

<style>
:where(.dwui-input-radio) {
  display: inline-block;
}

/* ブラウザ既定のbaselineではボタンが文字より上に寄るため、ボタンと文字の中心を揃える */
:where(.dwui-input-radio > label > input, .dwui-input-radio > label > span) {
  vertical-align: middle;
}

/* ブラウザ既定のラジオの余白は上だけにあり、中心を揃えても下にずれるため上下の余白をなくす */
:where(.dwui-input-radio > label > input) {
  margin-block: 0;
}

/* ラジオとラベルの間隔。gapはflex専用のためmarginで空ける */
:where(.dwui-input-radio > label > span) {
  margin-left: var(--dwui-gap-input-radio, 2px);
}

:where(.dwui-input-radio > label > input:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
