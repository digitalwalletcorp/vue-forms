<!--
複数選択セレクトボックス
選択した項目のラベルをテキストエリアに表示し、クリックすると選択リストをドロップダウンで開く
-->
<template>
  <div class="dwui-multi-select-box">
    <Dropdown
      :shown="shown"
      :triggers="[]"
      placement="bottom-start"
      popper-class="dwui-dropdown"
      @update:shown="onUpdateShown"
      @apply-hide="emit('emit:listClosed')"
    >
      <!-- vidを指定してerrorObserverが機能するようにしてあるので、生のtextareaではなくTextAreaを利用する -->
      <TextArea
        ref="refTextArea"
        :model-value="displayLabel"
        :vid="props.vid"
        :index="props.index"
        :id="props.id"
        :name="props.name"
        :cols="props.cols"
        :rows="props.rows"
        :disabled="props.disabled"
        readonly
        :class="props.inputClass"
        :style="props.inputStyle"
        @click="onClickTextArea"
        @keydown="onKeydownTextArea"
      />
      <template #popper>
        <MultiSelectBoxList
          v-if="shown"
          :model-value="props.modelValue"
          :items="props.items"
          :no-blank="props.noBlank"
          :button-labels="props.buttonLabels"
          :button-class="props.buttonClass"
          :button-style="props.buttonStyle"
          @emit:apply="onApply"
          @emit:close="shown = false"
        />
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { Dropdown } from 'floating-vue';
import { resolveLabel } from '@/internal/form-helper';
import TextArea from '@/text-area.vue';
import MultiSelectBoxList from '@/internal/multi-select-box-list.vue';
import type { GroupValueLabelPair, MultiSelectBoxButtonLabels, NumberModelType, StringModelType, ValueLabelPair } from '@/types/form';

type Item = ValueLabelPair<StringModelType | NumberModelType> | GroupValueLabelPair<StringModelType | NumberModelType>;

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値。選択された項目のvalueの配列 */
  modelValue: (StringModelType | NumberModelType)[];
  /** 配列の要素の型。未指定の場合は'string' */
  modelType?: 'string' | 'number';
  /** 選択肢 */
  items?: Item[];
  /** 選択リストの先頭に空白の選択肢を置かない */
  noBlank?: boolean;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** trueの場合、テキストエリアに選択した項目を1行ずつ表示する。falseの場合はカンマ区切り */
  lineFeed?: boolean;
  /** 選択リストのボタンの文言 */
  buttonLabels?: MultiSelectBoxButtonLabels;
  /** textareaのid。ルートが入れ物のため、属性の引き継ぎではtextareaに届かない */
  id?: string;
  /** textareaのname。ルートが入れ物のため、属性の引き継ぎではtextareaに届かない */
  name?: string;
  /** textareaの列数。ルートが入れ物のため、属性の引き継ぎではtextareaに届かない */
  cols?: number;
  /** textareaの行数。ルートが入れ物のため、属性の引き継ぎではtextareaに届かない */
  rows?: number;
  /** textareaの非活性。ルートが入れ物のため、属性の引き継ぎではtextareaに届かない */
  disabled?: boolean;
  /** textareaに付けるclass */
  inputClass?: ClassValue;
  /** textareaに付けるstyle */
  inputStyle?: StyleValue;
  /** 選択リストのボタンに付けるclass */
  buttonClass?: ClassValue;
  /** 選択リストのボタンに付けるstyle */
  buttonStyle?: StyleValue;
}
const props = withDefaults(defineProps<Props>(), {
  modelType: 'string',
  items: () => [],
  noBlank: true,
  cols: 20,
  rows: 1
});

interface Emits {
  (e: 'update:modelValue', value: (StringModelType | NumberModelType)[]): void;
  (e: 'emit:change', value: (StringModelType | NumberModelType)[]): void;
  (e: 'emit:listClosed'): void;
}
const emit = defineEmits<Emits>();

const refTextArea = ref<InstanceType<typeof TextArea>>();

const shown = ref(false);

/** テキストエリアの右下からこの範囲をクリックした場合は、リサイズの操作とみなしてリストを開かない */
const RESIZE_HANDLE_SIZE = 20;

const displayLabel = computed(() => {
  const labels: string[] = [];
  for (const item of flattenItems(props.items)) {
    if (props.modelValue.some(value => String(value) === String(item.value))) {
      labels.push(resolveLabel(item.label));
    }
  }
  return props.lineFeed ? labels.join('\n') : labels.join(', ');
});

const onClickTextArea = (e: MouseEvent) => {
  const target = e.target as HTMLTextAreaElement;
  const rect = target.getBoundingClientRect();
  if (rect.right - RESIZE_HANDLE_SIZE < e.clientX && rect.bottom - RESIZE_HANDLE_SIZE < e.clientY) {
    return;
  }
  openList();
};

const onKeydownTextArea = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openList();
  }
};

const onUpdateShown = (value: boolean) => {
  shown.value = value;
};

const onApply = (values: (StringModelType | NumberModelType)[]) => {
  emitChange(sortByItems(values));
};

/**
 * 選択リストを開く
 */
const openList = () => {
  if (!props.disabled) {
    shown.value = true;
  }
};

/**
 * update:modelValueとemit:changeを同じ値で発火する
 *
 * @param {(string | number | null)[]} value バインド値
 */
const emitChange = (value: (StringModelType | NumberModelType)[]): void => {
  emit('update:modelValue', value);
  emit('emit:change', value);
};

// optGroupを持つGroupValueLabelPairか判定するタイプガード
const isGroup = (item: Item): item is GroupValueLabelPair<StringModelType | NumberModelType> => 'optGroup' in item;

/**
 * グループを展開し、選択できる項目だけを選択肢の並び順で返す
 *
 * @param {Item[]} items
 * @returns {ValueLabelPair<string | number | null>[]}
 */
const flattenItems = (items: Item[]): ValueLabelPair<StringModelType | NumberModelType>[] => {
  return items.flatMap(item => isGroup(item) ? item.children : [item]);
};

/**
 * 選択された値を、選択肢の並び順に並べ直し、modelTypeの型にして返す
 * チェックした順に末尾へ追加されるため、元の選択肢の順に戻す
 *
 * @param {(string | number | null)[]} values
 * @returns {(string | number | null)[]}
 */
const sortByItems = (values: (StringModelType | NumberModelType)[]): (StringModelType | NumberModelType)[] => {
  const result: (StringModelType | NumberModelType)[] = [];
  for (const item of flattenItems(props.items)) {
    if (values.some(value => String(value) === String(item.value))) {
      if (props.modelType === 'number') {
        result.push(item.value == null || ['', 'null'].includes(String(item.value)) ? null : Number(item.value));
      } else {
        result.push(String(item.value));
      }
    }
  }
  return result;
};

defineExpose({
  /**
   * TEXTAREAエレメントを返す
   */
  getInstance: (): HTMLTextAreaElement | undefined => {
    return refTextArea.value?.getInstance();
  },
  /**
   * TEXTAREAエレメントにFocusを設定する
   */
  setFocus: (): void => {
    refTextArea.value!.setFocus();
  },
  /**
   * 現在の選択値でChangeイベントを発火する
   */
  fireChange: (): void => {
    emitChange(props.modelValue);
  },
  /**
   * 現在の選択値を返す
   *
   * @returns {(string | number | null)[]}
   */
  getCurrentValue: (): (StringModelType | NumberModelType)[] => {
    return props.modelValue;
  }
});
</script>

<style>
:where(.dwui-multi-select-box) {
  display: inline-block;
}

:where(.dwui-multi-select-box .dwui-text-area) {
  cursor: pointer;
}

/*
 * ドロップダウンのパネル(floating-vueのdropdownテーマ)の配色を、ページのcolor-schemeに合わせる。
 * テーマ側の指定(.v-popper--theme-dropdown .v-popper__inner)より詳細度を上げないと既定の白が勝つため、
 * ここだけは:where()で詳細度を0にせず、クラスを重ねて上書きする。色の変更は--dwui-*の変数で行う
 */
.v-popper--theme-dropdown.dwui-dropdown .v-popper__inner {
  border-color: var(--dwui-border-color-dropdown, light-dark(#dddddd, #4a4d55));
  background: var(--dwui-background-dropdown, light-dark(#ffffff, #2d2f34));
  color: var(--dwui-color-text-dropdown, light-dark(#000000, #e6e6e6));
}

.v-popper--theme-dropdown.dwui-dropdown .v-popper__arrow-inner {
  border-color: var(--dwui-background-dropdown, light-dark(#ffffff, #2d2f34));
}

.v-popper--theme-dropdown.dwui-dropdown .v-popper__arrow-outer {
  border-color: var(--dwui-border-color-dropdown, light-dark(#dddddd, #4a4d55));
}
</style>
