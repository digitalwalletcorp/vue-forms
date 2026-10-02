<!--
セレクトボックス
-->
<template>
  <select
    ref="refSelect"
    v-tooltip.right="errorMessage"
    :value="props.modelValue"
    class="dwui-select-box"
    :class="{ 'dwui-error': hasError }"
    @change="onChange"
  >
    <template
      v-for="(option, idx) in selectOptions"
      :key="idx"
    >
      <template v-if="isGroup(option)">
        <optgroup :label="option.optGroup">
          <option
            v-for="(child, idx2) in option.children"
            :key="idx2"
            :value="child.value"
            :disabled="child.disabled"
          >
            {{ child.label }}
          </option>
        </optgroup>
      </template>
      <template v-else>
        <option
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </template>
    </template>
  </select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { vTooltip } from 'floating-vue';
import { useInputError } from '@/error-observer';
import { resolveLabel } from '@/internal/form-helper';
import type { BooleanModelType, GroupValueLabelPair, NumberModelType, StringModelType, ValueLabelPair } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値 */
  modelValue?: StringModelType | NumberModelType | BooleanModelType;
  /** バインド値の型。未指定の場合は'string' */
  modelType?: 'string' | 'number' | 'boolean';
  /** 選択肢 */
  items?: (ValueLabelPair<StringModelType | NumberModelType | BooleanModelType> | GroupValueLabelPair<StringModelType | NumberModelType | BooleanModelType>)[];
  /** 先頭に空白の選択肢を置かない */
  noBlank?: boolean;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
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

const refSelect = ref<HTMLSelectElement>();

const selectOptions = computed(() => {
  const options = [] as (ValueLabelPair<string, string> | GroupValueLabelPair<string, string>)[];
  if (!props.noBlank) {
    options.push({ value: '', label: '' });
  }
  if (props.items) {
    return props.items.reduce((acc, item) => {
      if (item.visible !== false) {
        if (isGroup(item)) {
          acc.push({
            disabled: item.disabled,
            optGroup: item.optGroup,
            children: item.children?.reduce((acc2, child) => {
              if (child.visible !== false) {
                acc2.push({
                  value: String(child.value),
                  label: resolveLabel(child.label),
                  disabled: child.disabled
                });
              }
              return acc2;
            }, [] as ValueLabelPair<string, string>[]) ?? []
          });
        } else {
          acc.push({
            value: String(item.value),
            label: resolveLabel(item.label),
            disabled: item.disabled
          });
        }
      }
      return acc;
    }, options);
  }
  return options;
});

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const emitValue = toModelValue(target.value);
  emit('update:modelValue', emitValue);
  emit('emit:change', emitValue);
};

/**
 * selectの値をmodelTypeに合わせて変換する
 * 選択肢の値は文字列にして描画しているため、値がnullの選択肢は'null'になる
 *
 * @param {string} value selectの値
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

// optGroupを持つGroupValueLabelPairか判定するタイプガード
const isGroup = (item: ValueLabelPair<unknown, unknown> | GroupValueLabelPair<unknown, unknown>): item is GroupValueLabelPair => 'optGroup' in item;

/**
 * modelValueがnullのとき、空白(値が''または'null')の選択肢を選択状態にする
 * :valueのバインドだけではnullに対応する選択肢が選ばれないため
 */
const selectCurrent = () => {
  if (props.modelValue === null) {
    const flatOptions = selectOptions.value.flatMap(item => isGroup(item) ? item.children : [item]);
    const index = flatOptions.findIndex(a => ['', 'null'].includes(String(a.value)));
    if (index !== -1 && refSelect.value) {
      refSelect.value.selectedIndex = index;
    }
  }
};

onMounted(() => {
  selectCurrent();
});

// itemsが途中で変わるケースでは、監視しないと正しい選択状態にならない
watch([() => props.items, () => props.modelValue], () => {
  selectCurrent();
}, {
  deep: true,
  flush: 'post'
});

defineExpose({
  /**
   * SELECTエレメントを返す
   */
  getInstance: (): HTMLSelectElement | undefined => {
    return refSelect.value;
  },
  /**
   * SELECTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refSelect.value!.focus();
  },
  /**
   * 現在のmodelValueの値をセレクトボックスの選択値に反映する
   * nullが設定されている場合、この関数を呼び出さないと反映できない場合がある
   */
  setCurrent: (): void => {
    selectCurrent();
  },
  /**
   * SELECTエレメントのChangeイベントを発火する
   */
  fireChange: (): void => {
    if (!refSelect.value) {
      return;
    }
    const value = toModelValue(refSelect.value.value);
    emit('update:modelValue', value);
    emit('emit:change', value);
  },
  /**
   * 現在の設定値を返す
   * SELECTエレメントが無いときは、空白の選択肢を選んだときと同じ値を返す
   *
   * @returns {string | number | boolean | null}
   */
  getCurrentValue: (): StringModelType | NumberModelType | BooleanModelType => {
    return toModelValue(refSelect.value?.value ?? '');
  }
});
</script>

<style>
:where(.dwui-select-box.dwui-error) {
  background: var(--dwui-background-form-error, light-dark(#fed0e0, #5c2633));
  border-color: var(--dwui-border-color-form-error, light-dark(orangered, #ff7b5c));
  color: var(--dwui-color-text-form-error, light-dark(#000000, #ffe3ea));
}

:where(.dwui-select-box:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
