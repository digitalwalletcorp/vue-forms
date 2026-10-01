<!--
スイッチボタン
チェックボックスをスイッチの見た目で表示する。ON/OFFでbooleanを束縛する
-->
<template>
  <div
    v-tooltip.right="errorMessage"
    class="dwui-switch-button"
    :class="{ 'dwui-error': hasError }"
    :style="backgroundStyle"
  >
    <label>
      <input
        :id="props.id"
        ref="refInputCheckBox"
        type="checkbox"
        :checked="props.modelValue"
        :name="props.name"
        :disabled="props.disabled"
        @change="onChange"
      >
      <span class="dwui-switch-button-label">
        <span class="dwui-switch-button-label-off"><slot name="label-off">{{ props.labelOff }}</slot></span>
        <span class="dwui-switch-button-label-on"><slot name="label-on">{{ props.labelOn }}</slot></span>
      </span>
      <span class="dwui-switch-button-handle" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { StyleValue } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。trueのときON */
  modelValue?: boolean;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** ONのときのラベル。label-onスロットを渡した場合はスロットが優先される */
  labelOn?: string;
  /** OFFのときのラベル。label-offスロットを渡した場合はスロットが優先される */
  labelOff?: string;
  /** ONのときの背景(backgroundの値)。未指定ならスタイルシートの既定が効く */
  bgOn?: string;
  /** OFFのときの背景(backgroundの値)。未指定ならスタイルシートの既定が効く */
  bgOff?: string;
  /** inputのid。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  id?: string;
  /** inputのname。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  name?: string;
  /** inputの非活性。ルートがlabelのため、属性の引き継ぎではinputに届かない */
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false
});

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'emit:change', value: boolean): void;
}
const emit = defineEmits<Emits>();

interface Slots {
  'label-on'?(): unknown;
  'label-off'?(): unknown;
}
defineSlots<Slots>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputCheckBox = ref<HTMLInputElement>();

// 背景はCSS変数で持ち、渡されたときだけ上書きする。渡されなければ:where()の既定が効く
const backgroundStyle = computed((): StyleValue => {
  const style: Record<string, string> = {};
  if (props.bgOff != null) {
    style['--dwui-background-switch-button'] = props.bgOff;
  }
  if (props.bgOn != null) {
    style['--dwui-background-switch-button-checked'] = props.bgOn;
  }
  return style;
});

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emitChange(target.checked);
};

/**
 * update:modelValueとemit:changeを同じ値で発火する
 *
 * @param {boolean} value バインド値
 */
const emitChange = (value: boolean): void => {
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
   * ON/OFFの表示を設定する。バインド値は変更しない
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
    emitChange(refInputCheckBox.value!.checked);
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {boolean}
   */
  getCurrentValue: (): boolean => {
    return refInputCheckBox.value!.checked;
  }
});
</script>

<style>
:where(.dwui-switch-button) {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: 46px;
  height: 20px;
  border-radius: 12px;
  cursor: pointer;
}

/* クリックで切り替わる範囲をスイッチ全体に広げる */
:where(.dwui-switch-button > label) {
  display: block;
  height: inherit;
  border-radius: inherit;
}

/* inputは透明にして重ね、見た目は後ろの溝とつまみで描く */
:where(.dwui-switch-button > label > input) {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  opacity: 0;
}

:where(.dwui-switch-button-label) {
  position: relative;
  display: block;
  height: inherit;
  border-radius: inherit;
  background: var(--dwui-background-switch-button, light-dark(#eceeef, #4a4d55));
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 0 2px rgba(0, 0, 0, 0.15);
  font-size: 10px;
  transition: opacity 0.15s ease-out, background 0.15s ease-out;
}

:where(.dwui-switch-button > label > input:checked ~ .dwui-switch-button-label) {
  background: var(--dwui-background-switch-button-checked, #47a8d8);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 0 3px rgba(0, 0, 0, 0.2);
}

/* inputは透明なので、フォーカスリングは見えている溝に描く */
:where(.dwui-switch-button > label > input:focus-visible ~ .dwui-switch-button-label) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}

:where(.dwui-switch-button-label-off, .dwui-switch-button-label-on) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  line-height: 1;
  transition: inherit;
}

:where(.dwui-switch-button-label-off) {
  right: 7px;
  color: var(--dwui-color-text-switch-button, light-dark(#aaaaaa, #a0a4ab));
}

:where(.dwui-switch-button-label-on) {
  left: 7px;
  color: var(--dwui-color-text-switch-button-checked, #ffffff);
  opacity: 0;
}

:where(.dwui-switch-button > label > input:checked ~ .dwui-switch-button-label .dwui-switch-button-label-off) {
  opacity: 0;
}

:where(.dwui-switch-button > label > input:checked ~ .dwui-switch-button-label .dwui-switch-button-label-on) {
  opacity: 1;
}

:where(.dwui-switch-button-handle) {
  position: absolute;
  top: 1px;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 10px;
  background: var(--dwui-background-switch-button-handle, linear-gradient(0.25turn, #888484 0%, #b4abab 50%, #888484 100%));
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
  transition: left 0.15s ease-out;
}

:where(.dwui-switch-button > label > input:checked ~ .dwui-switch-button-handle) {
  left: 27px;
  box-shadow: -1px 1px 5px rgba(0, 0, 0, 0.2);
}

:where(.dwui-switch-button > label > input:disabled ~ .dwui-switch-button-label, .dwui-switch-button > label > input:disabled ~ .dwui-switch-button-handle) {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
