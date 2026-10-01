<!--
ファイル選択
-->
<template>
  <input
    ref="refInputFile"
    v-tooltip.right="errorMessage"
    type="file"
    :accept="Array.isArray(props.accept) ? props.accept.join(',') : props.accept"
    class="dwui-input-file"
    :class="{ 'dwui-error': hasError }"
    @change="onChange"
  >
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。nullにすると選択を解除する */
  modelValue?: FileList | null;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** 選択できるファイルの種類。配列の場合はカンマ区切りにしてaccept属性に設定する */
  accept?: string | string[];
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', value: FileList | null): void;
  (e: 'emit:change', value: FileList | null): void;
}
const emit = defineEmits<Emits>();

const { hasError, message: errorMessage } = useInputError(() => props.vid, () => props.index);

const refInputFile = ref<HTMLInputElement>();

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = toModelValue(target.files);
  emit('update:modelValue', files);
  emit('emit:change', files);
};

/**
 * 選択されたファイルをバインド値に変換する。1件も選択されていない場合はnullにする
 *
 * @param {FileList | null} files 選択されたファイル
 * @returns {FileList | null}
 */
const toModelValue = (files: FileList | null): FileList | null => {
  return files && 0 < files.length ? files : null;
};

/**
 * ファイルの選択表示を解除する。バインド値は変更しない
 */
const clearInput = () => {
  if (refInputFile.value) {
    refInputFile.value.value = '';
  }
};

watch(() => props.modelValue, (newValue: FileList | null | undefined, oldValue: FileList | null | undefined): void => {
  if (newValue == null && oldValue != null) {
    // props.modelValue が非NULLからNULLに変わった場合
    clearInput();
  }
});

defineExpose({
  /**
   * INPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return refInputFile.value;
  },
  /**
   * INPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refInputFile.value!.focus();
  },
  /**
   * INPUTエレメントのChangeイベントを発火する
   */
  fireChange: (): void => {
    if (refInputFile.value) {
      onChange({ target: refInputFile.value } as unknown as Event);
    }
  },
  /**
   * ファイルの選択表示を解除する。バインド値は変更しない
   */
  clearInput: clearInput,
  /**
   * 現在の設定値を返す
   *
   * @returns {FileList | null}
   */
  getCurrentValue: (): FileList | null => {
    return toModelValue(refInputFile.value!.files);
  }
});
</script>

<style>
:where(.dwui-input-file.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-input-file:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
